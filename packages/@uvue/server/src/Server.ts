import jsonEncode from 'fast-safe-stringify';
import { existsSync, readFileSync } from 'fs-extra';
import { IncomingMessage, ServerResponse } from 'http';
import micromatch from 'micromatch';
import { join } from 'path';
import { ConnectAdapter } from './ConnectAdapter';
import { IAdapter, IRenderer, IRequestContext, IServer, IServerOptions } from './interfaces';
import { Renderer } from './Renderer';

export class Server implements IServer {
  /**
   * Templates to render full pages
   */
  public templates: {
    spa: string;
    ssr: string;
  };
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
  public addPlugin(plugin: any, options?: any) {
    this.plugins.push({
      options,
      plugin,
    });
  }

  /**
   * Call hooks from plugins
   */
  public async callHook(name: string, ...args: any[]) {
    for (const item of this.plugins) {
      if (typeof item.plugin === 'function' && name === 'beforeStart') {
        await item.plugin(...args);
      } else if (typeof item.plugin[name] === 'function') {
        await item.plugin[name](...args);
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
    if (!this.options.webpack) {
      // Development mode
      readyPromise = require('./devMiddleware')((serverBundle, { clientManifest }) => {
        this.renderer = new Renderer(serverBundle, {
          ...this.options.renderer,
          clientManifest,
        });
      });

      // Production mode
    } else {
      const { clientManifest, serverBundle, templates } = this.getBuiltFiles();
      this.templates = templates;

      this.renderer = new Renderer(serverBundle, {
        ...this.options.renderer,
        clientManifest,
      });
    }

    await readyPromise;

    // Setup last middleware: renderer
    this.use((req: IncomingMessage, res: ServerResponse) => this.renderMiddleware(req, res));
  }

  /**
   * Simple middleware to render a page
   */
  private async renderMiddleware(req: IncomingMessage, res: ServerResponse) {
    const response = {
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

          response.body = this.spaBuilder();
        } else {
          // SSR Process

          // Render page body
          response.body = await this.renderer.render(context);

          // Hook before building the page
          await this.callHook('beforeBuild', response, context, this);

          // Build page
          response.body = await this.ssrBuilder(response.body, context);
        }

        // Hook on rendered
        await this.callHook('rendered', response, context, this);

        // Send response
        this.sendResponse(response, context);
      }
    } catch (err) {
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
  }

  /**
   * Send HTTP response
   */
  private sendResponse(response: { body: string; status: number }, { res }) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Length', response.body.length);

    if (response.body.length) {
      res.statusCode = response.status;
    }
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

  /**
   * Render SSR page
   */
  private ssrBuilder(body: string, context: IRequestContext) {
    let head = '';
    let bodyAttrs = '';
    let htmlAttrs = '';

    // Add Vuex and components data
    body += `<script data-vue-ssr-data>window.__DATA__=${jsonEncode(context.data)}</script>`;

    // Body additions
    if (typeof context.bodyAdd === 'string') {
      body += context.bodyAdd;
    }

    /**
     * Handle vue-meta
     */
    if (context.meta) {
      const metas = context.meta.inject();

      bodyAttrs = metas.bodyAttrs.text();
      htmlAttrs = metas.htmlAttrs.text();

      // Inject metas to head
      head =
        metas.meta.text() +
        metas.title.text() +
        metas.link.text() +
        metas.style.text() +
        metas.script.text() +
        metas.noscript.text();
    }

    // Build head
    if (context.headAdd) {
      head += context.headAdd;
    }

    // Handle styles
    head += context.renderStyles();

    // Resource hints
    head += context.renderResourceHints();

    // Build body
    body += context.renderScripts();

    // Replace final html
    const result = this.templates.ssr
      .replace(/data-html-attrs(="")?/i, htmlAttrs)
      .replace(/data-body-attrs(="")?/i, bodyAttrs)
      .replace(/<ssr-head\/?>/i, head)
      .replace(/<ssr-body\/?>/i, body)
      .replace(/<\/ssr-head>/i, '')
      .replace(/<\/ssr-body>/i, '');

    return result;
  }

  /**
   * Render SPA page
   */
  private spaBuilder() {
    return this.templates.spa.replace(/<ssr-head\/?>/i, '').replace(
      /<ssr-body\/?>/i,
      `<div id="app"></div>
        <script data-vue-spa>window.__SPA_ROUTE__=true;</script>`,
    );
  }
}
