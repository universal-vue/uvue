import { EventEmitter } from 'events';
import * as http from 'http';
import * as http2 from 'http2';
import * as https from 'https';
import * as killable from 'killable';
import * as micromatch from 'micromatch';
import { IAdapter, IAdapterOptions, IRequestContext, IResponseContext } from '../interfaces';
import { Server } from '../Server';

/**
 * Connect server adapter
 */
export class ConnectAdapter implements IAdapter {
  /**
   * Connect instance
   */
  protected app: any;

  /**
   * HTTP server instance
   */
  protected server: http.Server | https.Server | http2.Http2Server;

  constructor(protected uvueServer: Server, protected options: IAdapterOptions = {}) {
    // Default options
    this.options = Object.assign(
      { host: process.env.HOST || '0.0.0.0', port: process.env.PORT || 8080 },
      this.options,
    );
  }

  public createApp(adatperArgs: any[] = []) {
    // Create connect instance
    this.app = require('connect')();

    // Create HTTP server
    const httpsOptions = this.options.https || { key: null, cert: null };
    if (httpsOptions.key && httpsOptions.cert) {
      if (this.options.http2) {
        this.server = http2.createSecureServer(httpsOptions, this.app);
      } else {
        this.server = https.createServer(httpsOptions, this.app);
      }
    } else {
      this.server = http.createServer(this.app);
    }
  }

  public getApp() {
    return this.app;
  }

  /**
   * Method to add middlewares
   */
  public use(...args: any[]): IAdapter | any {
    this.app.use(...args);
    return this;
  }

  /**
   * Start server
   */
  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(this.options.port, this.options.host, () => {
        resolve();
      });
      killable(this.server);
    });
  }

  /**
   * Stop server
   */
  public stop(): Promise<void> {
    return new Promise(resolve => {
      (this.server as any).kill(resolve);
    });
  }

  /**
   * Middleware to render pages
   */
  public async renderMiddleware(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    middlewareContext: any = {},
  ) {
    const response: IResponseContext = this.createResponseContext(req, res, middlewareContext);
    const context: IRequestContext = this.createRequestContext(req, res, middlewareContext);

    context.events.on('error', ({ error, from }) => {
      this.uvueServer.logger.error(error);
    });

    try {
      // Hook before render
      await this.uvueServer.invokeAsync('beforeRender', response, context, this.uvueServer);

      if (!res.finished && !response.skipRender) {
        const { spaPaths } = this.uvueServer.options;

        if (spaPaths && spaPaths.length && micromatch.some(context.url, spaPaths)) {
          // SPA paths

          response.body = await this.uvueServer.renderer.renderSPAPage();
        } else {
          // SSR Process

          // Render page body
          response.body = await this.uvueServer.renderer.render(context);

          // Check if there is a redirection
          if (context.redirected) {
            return;
          }

          // Hook before building the page
          await this.uvueServer.invokeAsync('beforeBuild', response, context, this.uvueServer);

          // Build page
          response.body = await this.uvueServer.renderer.renderSSRPage(response.body, context);
        }

        // Hook on rendered
        await this.uvueServer.invokeAsync('rendered', response, context, this.uvueServer);
      }
    } catch (err) {
      this.uvueServer.logger.error(err);

      // Catch errors
      await this.uvueServer.invokeAsync('routeError', err, response, context, this.uvueServer);
    }

    // Send response
    this.send(response, context);

    // Hook after response was sent
    this.uvueServer.invoke('afterResponse', response, context, this.uvueServer);

    // Remove listeners
    context.events.removeAllListeners();

    return {
      context,
      response,
    };
  }

  public setupRenderer() {
    this.app.use(this.renderMiddleware.bind(this));
  }

  /**
   * Get server instance
   */
  public getHttpServer() {
    return this.server;
  }

  /**
   * Get port
   */
  public getPort() {
    return this.options.port;
  }

  /**
   * Get host
   */
  public getHost() {
    return this.options.host;
  }

  /**
   * Is HTTPS ?
   */
  public isHttps() {
    return this.server instanceof https.Server;
  }

  /**
   * Send HTTP response
   */
  protected send(response: { body: string; status: number }, { res, statusCode }: IRequestContext) {
    if (res.finished) {
      return;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Length', Buffer.byteLength(response.body, 'utf-8'));
    res.statusCode = statusCode || response.status;
    res.end(response.body);
  }

  protected createRequestContext(...args: any[]): IRequestContext;
  protected createRequestContext(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): IRequestContext {
    return {
      data: {},
      events: new EventEmitter(),
      redirected: false,
      req,
      res,
      url: req.url,
    };
  }

  protected createResponseContext(...args: any[]): IResponseContext;
  protected createResponseContext(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): IResponseContext {
    return {
      body: '',
      status: 200,
    };
  }
}
