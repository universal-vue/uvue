import * as http from 'http';
import * as https from 'https';
import { IRequestContext } from '../interfaces';
import { ConnectAdapter } from './ConnectAdapter';

export class KoaAdapter extends ConnectAdapter {
  /**
   * Koa instance
   */
  protected app: any;

  public createApp(adatperArgs: any[] = []) {
    const Koa = require('koa');

    // Create connect instance
    this.app = new Koa();
    (this.app as any).__isKoa = true;

    // Create HTTP server
    const httpsOptions = this.options.https || { key: null, cert: null };
    if (httpsOptions.key && httpsOptions.cert) {
      this.server = https.createServer(httpsOptions, this.app.callback());
    } else {
      this.server = http.createServer(this.app.callback());
    }
  }

  /**
   * Method to add middlewares
   */
  public use(...args: any[]): KoaAdapter {
    if (args.length === 2) {
      this.app.use(require('koa-mount')(args[0], args[1]));
    } else {
      this.app.use(args[0]);
    }
    return this;
  }

  /**
   * Middleware to render pages
   */
  // @ts-ignore
  public async renderMiddleware(ctx: any) {
    const { req, res } = ctx;
    return super.renderMiddleware(req, res, { ctx });
  }

  protected createRequestContext(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    middlewareContext: any = {},
  ): IRequestContext {
    const context = super.createRequestContext(req, res, middlewareContext);

    const { ctx } = middlewareContext;
    context.inject = {
      ctx,
    };

    return context;
  }
}
