import * as connect from 'connect';
import * as consola from 'consola';
import * as http from 'http';
import * as https from 'https';
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
  public app: connect.Server | any;

  /**
   * HTTP server instance
   */
  protected server: http.Server | https.Server;

  constructor(protected uvueServer: Server, protected options: IAdapterOptions = {}) {
    // Default options
    this.options = Object.assign(
      { host: process.env.HOST || '0.0.0.0', port: process.env.PORT || 8080 },
      this.options,
    );
  }

  public createApp(adatperArgs: any[] = []) {
    // Create connect instance
    this.app = connect();

    // Create HTTP server
    const httpsOptions = this.options.https || { key: null, cert: null };
    if (httpsOptions.key && httpsOptions.cert) {
      this.server = https.createServer(httpsOptions, this.app);
    } else {
      this.server = http.createServer(this.app);
    }
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
      this.server.listen(this.options.port, this.options.host, err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  /**
   * Stop server
   */
  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  /**
   * Middleware to render pages
   */
  public async renderMiddleware(req: http.IncomingMessage, res: http.ServerResponse) {
    const response: IResponseContext = this.prepareResponseContext(req, res);
    const context: IRequestContext = this.prepareRequestContext(req, res);

    try {
      // Hook before render
      await this.uvueServer.invokeAsync('beforeRender', context, this);

      if (!res.finished) {
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
          await this.uvueServer.invokeAsync('beforeBuild', response, context, this);

          // Build page
          response.body = await this.uvueServer.renderer.renderSSRPage(response.body, context);
        }

        // Hook on rendered
        await this.uvueServer.invokeAsync('rendered', response, context, this);

        // Send response
        this.sendResponse(response, context);
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') {
        // tslint:disable-next-line
        consola.error(err);
      }

      // Catch errors
      await this.uvueServer.invokeAsync('routeError', err, response, context, this);

      if (!res.finished) {
        response.body = response.body || 'Server error';
        response.status = 500;
        this.sendResponse(response, context);
      }
    }

    // Hook after response was sent
    this.uvueServer.invoke('afterResponse', context, this);

    return {
      context,
      response,
    };
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
  protected sendResponse(
    response: { body: string; status: number },
    { res, statusCode }: IRequestContext,
  ) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Length', response.body.length);
    res.statusCode = statusCode || response.status;
    res.end(response.body);
  }

  protected prepareRequestContext(...args: any[]): IRequestContext;
  protected prepareRequestContext(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): IRequestContext {
    return {
      data: {},
      redirected: false,
      req,
      res,
      url: req.url,
    };
  }

  protected prepareResponseContext(...args: any[]): IResponseContext;
  protected prepareResponseContext(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): IResponseContext {
    return {
      body: '',
      status: 200,
    };
  }
}
