import * as consola from 'consola';
import * as http from 'http';
import * as https from 'https';
import * as Koa from 'koa';
import * as mount from 'koa-mount';
import * as micromatch from 'micromatch';
import { IAdapter, IRequestContext, IResponseContext } from '../interfaces';
import { ConnectAdapter } from './ConnectAdapter';

/*
Required deps: koa koa-mount koa-compress koa-static koa-webpack
*/

export class KoaAdapter extends ConnectAdapter {
  /**
   * Koa instance
   */
  public app: Koa;

  public createApp() {
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
      this.app.use(mount(args[0], args[1]));
    } else {
      this.app.use(args[0]);
    }
    return this;
  }

  /**
   * Middleware to render pages
   */
  // @ts-ignore
  public async renderMiddleware(ctx: Koa.Context) {
    const { req, res } = ctx;

    const response: IResponseContext = {
      body: '',
      status: 200,
    };

    const context: IRequestContext = {
      data: {},
      redirected: false,
      req,
      res,
      url: req.url,
    };

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

  protected prepareRequestContext(ctx: Koa.Context): IRequestContext {
    const { req, res, cookies } = ctx;
    const context = super.prepareRequestContext(req, res);

    context.ctx = ctx;
    context.req = req;
    context.res = res;
    context.cookies = cookies;

    return context;
  }
}
