import lruCache from 'lru-cache';
import { BundleRenderer, createBundleRenderer } from 'vue-server-renderer';
import { IRenderer, IRendererOptions, IRequestContext } from './interfaces';

export class Renderer implements IRenderer {
  private vue: BundleRenderer;

  constructor(bundle: any, private options: IRendererOptions) {
    this.vue = createBundleRenderer(bundle, {
      ...{
        cache: lruCache({
          max: 1000,
          maxAge: 1000 * 60 * 15,
        }),
        runInNewContext: false,
      },
      ...(this.options || {}),
    });
  }

  public render(context: IRequestContext): Promise<string> {
    return this.vue.renderToString(context);
  }
}
