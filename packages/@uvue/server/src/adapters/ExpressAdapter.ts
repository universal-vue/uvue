import * as express from 'express';
import * as http from 'http';
import * as https from 'https';
import { IAdapter, IAdapterOptions } from '../interfaces';

export class ExpressAdapter implements IAdapter {
  /**
   * Express instance
   */
  public app: express.Express;

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

    // Create connect instance
    this.app = express();

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
  public use(...args: any[]): ExpressAdapter {
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
