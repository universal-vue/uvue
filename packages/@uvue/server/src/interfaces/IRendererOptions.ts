import { RenderCache } from 'vue-server-renderer';
import { IServer } from './IServer';

export interface IRendererOptions {
  // For Vue renderer
  clientManifest?: any;
  cache?: RenderCache;
  directives?: {
    [name: string]: any;
  };
  shouldPreload?: (file: string, type: string) => boolean;
  shouldPrefetch?: (file: string, type: string) => boolean;

  // For page renderer
  templates: {
    spa: string;
    ssr: string;
  };
}
