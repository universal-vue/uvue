import { HandleFunction } from 'connect';
import * as pino from 'pino';
import { IAdapter } from './IAdapter';
import { IServerOptions } from './IServerOptions';

export interface IServer {
  // Options
  options: IServerOptions;

  // Logger
  logger: pino.Logger;

  // Instances getters
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
