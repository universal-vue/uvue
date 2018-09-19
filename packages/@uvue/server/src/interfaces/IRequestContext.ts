import { IncomingMessage, ServerResponse } from 'http';

export interface IRequestContext {
  // Dynamic context
  [name: string]: any;

  // Incoming request variables
  req: IncomingMessage;
  res: ServerResponse;
  url: string;

  // Reponse variables
  redirected: boolean | number;
  statusCode?: number;

  // Body and head addition from app
  bodyAdd?: string;
  headAdd?: string;

  // Vuex and components data
  data?: {
    state?: any;
    components?: any[];

    // Dynamic data
    [name: string]: any;
  };

  // Metas
  meta?: {
    inject(): any;
  };

  /**
   * After Vue SSR process
   */

  // Functions from vue server renderer
  renderScripts?(): string;
  renderStyles?(): string;
  renderResourceHints?(): string;
}
