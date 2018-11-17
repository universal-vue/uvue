import { HandleFunction } from 'connect';
import http from 'http';
import https from 'https';

export interface IAdapter {
  app: any;

  // Add middlewares
  use(middleware: HandleFunction): any;
  use(path: string, middleware: HandleFunction): any;

  // Start/stop server
  start(): Promise<void>;
  stop(): Promise<void>;

  // Getters
  getHttpServer(): http.Server | https.Server;
  getPort(): number;
  getHost(): string;
  isHttps(): boolean;
}
