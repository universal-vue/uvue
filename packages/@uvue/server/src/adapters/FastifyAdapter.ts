import * as fastify from 'fastify';
import * as http from 'http';
import * as https from 'https';
import { ConnectAdapter } from './ConnectAdapter';

export class FastifyAdapter extends ConnectAdapter {
  /**
   * Fastify instance
   */
  public app: fastify.FastifyInstance;

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

    this.app = fastify(...adatperArgs);
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
    return new Promise((resolve, reject) => {
      this.app.close(() => {
        resolve();
      });
    });
  }
}
