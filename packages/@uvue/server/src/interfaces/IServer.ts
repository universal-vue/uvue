import { HandleFunction } from 'connect';
import { IncomingMessage, ServerResponse } from 'http';
import { IAdapter } from './IAdapter';
import { IServerOptions } from './IServerOptions';

export interface IServer {
  // Options
  options: IServerOptions;

  getAdapter(): IAdapter;
  getApp(): any;

  // Add middlewares
  use(middleware: HandleFunction);
  use(path: string, middleware: HandleFunction);

  // Plugins system
  addPlugin(plugin: any, options?: any);
  invoke(name: string, ...args: any[]): any;
  invokeAsync(name: string, ...args: any[]): Promise<any>;

  // Start/stop server
  start(): Promise<void>;
  stop(): Promise<void>;
}
