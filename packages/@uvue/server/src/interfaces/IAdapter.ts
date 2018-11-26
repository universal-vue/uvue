import { HandleFunction } from 'connect';
import http from 'http';
import https from 'https';

export interface IAdapter {
  app: any;

  // Create framework instance and HTTP server
  createApp(...args: any[]);

  // Add middlewares
  use(middleware: HandleFunction): any;
  use(path: string, middleware: HandleFunction): any;

  // Start/stop server
  start(): Promise<void>;
  stop(): Promise<void>;

  // Main middleware to render pages
  renderMiddleware(req: http.IncomingMessage, res: http.ServerResponse): Promise<any>;

  // Getters
  getHttpServer(): http.Server | https.Server;
  getPort(): number;
  getHost(): string;
  isHttps(): boolean;
}
