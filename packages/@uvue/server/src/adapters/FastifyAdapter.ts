import * as http from 'http';
import * as https from 'https';
import { IRequestContext } from '../interfaces';
import { ConnectAdapter } from './ConnectAdapter';

export class FastifyAdapter extends ConnectAdapter {
  /**
   * Fastify instance
   */
  protected app: any;

  public createApp(adatperArgs: any[] = []) {
    const serverFactory = (handler, opts) => {
      const httpsOptions = this.options.https || { key: null, cert: null };
      if (httpsOptions.key && httpsOptions.cert) {
        this.server = https.createServer(httpsOptions, (req, res) => {
          handler(req, res);
        });
      } else {
        this.server = http.createServer((req, res) => {
          handler(req, res);
        });
      }
      return this.server;
    };

    if (adatperArgs[0]) {
      adatperArgs[0].serverFactory = serverFactory;
    } else {
      adatperArgs[0] = {
        serverFactory,
      };
    }

    this.app = require('fastify')(...adatperArgs);
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
      this.app.close(resolve);
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
