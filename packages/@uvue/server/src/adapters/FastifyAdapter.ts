import * as fastify from 'fastify';
import * as http from 'http';
import * as https from 'https';
import { IAdapter, IAdapterOptions } from '../interfaces';

export class FastifyAdapter implements IAdapter {
  /**
   * Fastify instance
   */
  private app: fastify.FastifyInstance;

  /**
   * HTTP server instance
   */
  private server: http.Server | https.Server;

  constructor(private options: IAdapterOptions = {}) {
    // Default options
    this.options = Object.assign(
      { host: process.env.HOST || '0.0.0.0', port: process.env.PORT || 8080 },
      this.options,
    );

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

    this.app = fastify({ serverFactory } as any);
  }

  /**
   * Method to add middlewares
   */
  public use(...args: any[]): FastifyAdapter {
    if (args.length === 2) {
      this.app.use(args[0], args[1]);
    } else {
      this.app.use(args[0]);
    }
    return this;
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
}
