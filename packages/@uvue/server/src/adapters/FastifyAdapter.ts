import * as killable from 'killable';
import { IRequestContext } from '../interfaces';
import { ConnectAdapter } from './ConnectAdapter';

export class FastifyAdapter extends ConnectAdapter {
  /**
   * Fastify instance
   */
  protected app: any;

  public createApp(adapterArgs: any[] = []) {
    const httpsOptions = this.options.https || { key: null, cert: null };
    let [fastifyOptions] = adapterArgs;

    if (!fastifyOptions) {
      fastifyOptions = {};
    }

    if (!fastifyOptions.https && httpsOptions.key && httpsOptions.cert) {
      fastifyOptions.https = httpsOptions;
    }

    this.app = require('fastify')(fastifyOptions);

    killable(this.app.server);
    this.server = this.app.server;
  }

  /**
   * Start server
   */
  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.app.listen(this.options.port, this.options.host, err => {
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
    return new Promise(resolve => {
      (this.server as any).kill(() => {
        this.app.close(resolve);
      });
    });
  }

  public setupRenderer() {
    // Fastify doesnt found a route: call renderer
    this.app.setNotFoundHandler(async (request, reply) => {
      await this.renderMiddleware(request, reply);
    });
  }

  protected createRequestContext(request: any, reply: any): IRequestContext {
    const context = super.createRequestContext(request.req, reply.res);

    context.inject = {
      reply,
      request,
    };

    return context;
  }
}
