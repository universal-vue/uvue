import * as http from 'http';
import * as http2 from 'http2';
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
      if (this.options.http2) {
        this.server = http2.createSecureServer(httpsOptions, this.app.callback());
      } else {
        this.server = https.createServer(httpsOptions, this.app.callback());
      }
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

  /**
   * Send HTTP response
   */
  protected send(
    response: { body: string; status: number },
    { res, statusCode, ctx }: IRequestContext,
  ) {
    if (res.finished) {
      return;
    }

    ctx.response.set({
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Lenght': Buffer.byteLength(response.body, 'utf-8'),
    });
    ctx.response.status = statusCode || response.status;
    ctx.response.body = response.body;
  }

  protected createRequestContext(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    middlewareContext: any = {},
  ): IRequestContext {
    const context = super.createRequestContext(req, res, middlewareContext);

    const { ctx } = middlewareContext;
    context.ctx = ctx;
    context.inject = {
      ctx,
    };

    return context;
  }
}
