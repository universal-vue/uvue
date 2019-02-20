import * as dotenv from 'dotenv';
import { readFileSync, readJsonSync } from 'fs-extra';
import * as merge from 'lodash/merge';
import { join, resolve } from 'path';
import * as path from 'path';
import * as pino from 'pino';
import 'pino-pretty';
import { ConnectAdapter } from './adapters/ConnectAdapter';
import { setupDevMiddleware } from './devMiddleware';
import { IAdapter, IRenderer, IServer, IServerOptions } from './interfaces';
import { Renderer } from './Renderer';

export class Server implements IServer {
  /**
   * Utility function to replicate loadEnv from @vue/cli-service
   */
  public static loadEnv(name?: string, basePath: string = process.cwd()) {
    const load = (filepath: string) => {
      try {
        dotenv.config({
          path: filepath,
        });
      } catch (err) {
        if (err.toString().indexOf('ENOENT') < 0) {
          throw err;
        }
      }
    };

    if (name) {
      load(path.join(basePath, `.env.${name}.local`));
      load(path.join(basePath, `.env.${name}`));
    }

    load(path.join(basePath, `.env.local`));
    load(path.join(basePath, `.env`));
  }

  /**
   * Started boolean
   */
  public started: boolean = false;

  /**
   * Vue renderer
   */
  public renderer: IRenderer;

  /**
   * Logger instance
   */
  public logger: pino.Logger;

  /**
   * HTTP server adapter
   */
  private adapter: IAdapter;

  /**
   * Plugins stack
   */
  private plugins: Array<{
    plugin: any;
    options?: any;
  }> = [];

  /**
   * Constructor
   */
  constructor(public options: IServerOptions = {}) {
    // Default options
    this.options = merge(
      {
        distPath: resolve('dist'),
        uvueDir: 'uvue',
      },
      this.options,
    );

    if (!this.options.adapter) {
      this.options.adapter = ConnectAdapter;
    }
    this.adapter = new this.options.adapter(this, this.options.httpOptions);
    this.adapter.createApp(this.options.adapterArgs);

    this.logger = pino(
      merge(
        {
          prettyPrint: process.env.NODE_ENV !== 'production',
        },
        options.logger,
      ),
    );
  }

  /**
   * Return current http adapter
   */
  public getAdapter(): IAdapter {
    return this.adapter;
  }

  /**
   * Return current adapter framework instance
   */
  public getApp(): any {
    return this.adapter.getApp();
  }

  /**
   * Method to add middlewares
   */
  public use(...args: any[]): Server {
    if (args.length === 2) {
      this.adapter.use(args[0], args[1]);
    } else {
      this.adapter.use(args[0]);
    }
    return this;
  }

  /**
   * Method to declare a plugin
   */
  public addPlugin(plugin: any, options: any = {}): Server {
    this.plugins.push(plugin);
    if (typeof plugin.install === 'function') {
      plugin.install(this, options);
    }
    return this;
  }

  /**
   * Call hooks from plugins
   */
  public invoke(name: string, ...args: any[]) {
    for (const plugin of this.plugins) {
      if (typeof plugin[name] === 'function') {
        plugin[name](...args);
      }
    }
  }

  /**
   * Call hooks from plugins
   */
  public async invokeAsync(name: string, ...args: any[]) {
    for (const plugin of this.plugins) {
      if (typeof plugin[name] === 'function') {
        await plugin[name](...args);
      }
    }
  }

  /**
   * Start server
   */
  public async start() {
    let readyPromise = Promise.resolve();

    // Setup
    if (this.options.webpack) {
      // Development mode
      readyPromise = setupDevMiddleware(this, (serverBundle, { clientManifest, templates }) => {
        this.renderer = this.createRenderer({ serverBundle, clientManifest, templates });
      });
    } else {
      // Production mode
      this.setup();
    }

    await readyPromise;

    // In dev mode, setup middleware after build is ready
    if (this.options.webpack) {
      this.adapter.setupRenderer();
    }

    return this.adapter.start().then(() => {
      this.started = true;

      this.logger.info(`Server listening: ${this.getListenUri()}`);

      // Handle kill
      const signals = ['SIGINT', 'SIGTERM'];
      for (const signal of signals) {
        (process.once as any)(signal, () => {
          this.stop().then(() => process.exit(0));
        });
      }
    });
  }

  /**
   * Stop server
   */
  public async stop() {
    this.logger.info(`Stopping server...`);
    if (this.started) {
      process.removeAllListeners('SIGINT');
      process.removeAllListeners('SIGTERM');
      return this.adapter.stop();
    }
  }

  /**
   * Return new instance of a renderer
   */
  public createRenderer({ serverBundle, clientManifest, templates }) {
    return new Renderer(serverBundle, {
      ...this.options.renderer,
      clientManifest,
      templates,
    });
  }

  /**
   * Setup adapter, renderer and middleware
   */
  public setup() {
    const { clientManifest, serverBundle, templates } = this.getBuiltFiles();
    this.renderer = this.createRenderer({ serverBundle, clientManifest, templates });
    this.adapter.setupRenderer();
    return this;
  }

  /**
   * Read files content for renderer
   */
  private getBuiltFiles() {
    const { distPath, uvueDir } = this.options;

    const serverBundle = join(uvueDir, 'server-bundle.json');
    const clientManifest = join(uvueDir, 'client-manifest.json');
    const ssr = join(uvueDir, 'ssr.html');
    const spa = join(uvueDir, 'spa.html');

    return {
      clientManifest: readJsonSync(join(distPath, clientManifest)),
      serverBundle: readJsonSync(join(distPath, serverBundle)),
      templates: {
        spa: readFileSync(join(distPath, spa), 'utf-8'),
        ssr: readFileSync(join(distPath, ssr), 'utf-8'),
      },
    };
  }

  /**
   * Return listening URI
   */
  private getListenUri() {
    const protocol = this.adapter.isHttps() ? 'https' : 'http';
    return `${protocol}://${this.adapter.getHost()}:${this.adapter.getPort()}`;
  }
}
