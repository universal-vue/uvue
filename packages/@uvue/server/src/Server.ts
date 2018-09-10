import { existsSync, readFileSync } from 'fs-extra';
import { IncomingMessage, ServerResponse } from 'http';
import micromatch from 'micromatch';
import { join } from 'path';
import { ConnectAdapter } from './ConnectAdapter';
import { setupDevMiddleware } from './devMiddleware';
import {
  IAdapter,
  IRenderer,
  IRequestContext,
  IResponseContext,
  IServer,
  IServerOptions,
} from './interfaces';
import { Renderer } from './Renderer';

export class Server implements IServer {
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
   * Vue renderer
   */
  private renderer: IRenderer;

  /**
   * Constructor
   */
  constructor(public options: IServerOptions) {
    if (!this.options.adapter) {
      this.options.adapter = ConnectAdapter;
    }
    this.adapter = new this.options.adapter(options.httpOptions);
  }

  /**
   * Return current http adapter
   */
  public getAdapter(): IAdapter {
    return this.adapter;
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
  public addPlugin(plugin: any, options: any) {
    this.plugins.push(plugin);
    plugin.$options = options;
  }

  /**
   * Call hooks from plugins
   */
  public async callHook(name: string, ...args: any[]) {
    for (const plugin of this.plugins) {
      if (typeof plugin[name] === 'function') {
        await plugin[name].bind(plugin)(...args);
      }
    }
  }

  /**
   * Start server
   */
  public async start() {
    // Call beforeStart hook
    await this.callHook('beforeStart', this);

    let readyPromise = Promise.resolve();

    // Setup renderer
    if (this.options.webpack) {
      // Development mode
      readyPromise = setupDevMiddleware(this, (serverBundle, { clientManifest, templates }) => {
        this.renderer = new Renderer(serverBundle, {
          ...this.options.renderer,
          clientManifest,
          templates,
        });
      });

      // Production mode
    } else {
      const { clientManifest, serverBundle, templates } = this.getBuiltFiles();

      this.renderer = new Renderer(serverBundle, {
        ...this.options.renderer,
        clientManifest,
        templates,
      });
    }

    await readyPromise;

    // Setup last middleware: renderer
    this.use((req: IncomingMessage, res: ServerResponse) => this.renderMiddleware(req, res));

    return this.adapter.start();
  }

  /**
   * Simple middleware to render a page
   */
  private async renderMiddleware(req: IncomingMessage, res: ServerResponse) {
    const response: IResponseContext = {
      body: '',
      status: 200,
    };

    const context: IRequestContext = {
      redirected: false,
      req,
      res,
      url: req.url,
    };

    try {
      // Hook before render
      await this.callHook('beforeRender', context, this);

      if (!res.finished) {
        const { spaPaths } = this.options;

        if (spaPaths && spaPaths.length && micromatch.some(context.url, spaPaths)) {
          // SPA paths

          response.body = await this.renderer.renderSPAPage();
        } else {
          // SSR Process

          // Render page body
          response.body = await this.renderer.render(context);

          // Check if there is a redirection
          if (context.redirected) {
            return;
          }

          // Hook before building the page
          await this.callHook('beforeBuild', response, context, this);

          // Build page
          response.body = await this.renderer.renderSSRPage(response.body, context);
        }

        // Hook on rendered
        await this.callHook('rendered', response, context, this);

        // Send response
        this.sendResponse(response, context);
      }
    } catch (err) {
      // tslint:disable-next-line
      console.error(err);

      // Catch errors
      await this.callHook('routeError', err, response, context, this);

      if (!res.finished) {
        response.body = response.body || 'Server error';
        response.status = 500;
        this.sendResponse(response, context);
      }
    }

    // Hook after response was sent
    this.callHook('afterResponse', context, this);

    return {
      context,
      response,
    };
  }

  /**
   * Send HTTP response
   */
  private sendResponse(response: { body: string; status: number }, { res }) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Length', response.body.length);
    res.statusCode = response.status;
    res.end(response.body);
  }

  /**
   * Read files content for renderer
   */
  private getBuiltFiles() {
    const { outputDir, serverBundle, clientManifest } = this.options.paths;
    const { spa, ssr } = this.options.paths.templates;
    return {
      clientManifest: require(join(outputDir, clientManifest)),
      serverBundle: require(join(outputDir, serverBundle)),
      templates: {
        spa: readFileSync(join(outputDir, spa), 'utf-8'),
        ssr: readFileSync(join(outputDir, ssr), 'utf-8'),
      },
    };
  }
}
