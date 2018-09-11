import { IRequestContext } from './IRequestContext';
import { IResponseContext } from './IResponseContext';
import { IServer } from './IServer';

/**
 * Plugin hooks definition
 */
export interface IPlugin {
  // Install
  install?(server: IServer, ...args: any[]): any;

  // On server boot
  beforeStart?(server: IServer): Promise<any>;

  // Before a route render
  beforeRender?(context: IRequestContext, server: IServer): Promise<any>;

  // Before page render
  beforeBuild?(response: IResponseContext, context: IRequestContext, server: IServer): Promise<any>;

  // When page is fully rendered
  rendered?(response: IResponseContext, context: IRequestContext, server: IServer): Promise<any>;

  // On server/route error
  routeError?(
    error: any,
    response: IResponseContext,
    context: IRequestContext,
    server: IServer,
  ): Promise<any>;

  // When response is sent to client
  afterResponse?(context: IRequestContext, server: IServer): Promise<any>;
}
