import jsonEncode from 'fast-safe-stringify';
import * as lruCache from 'lru-cache';
import { merge } from 'lodash';
import { BundleRenderer, BundleRendererOptions, createBundleRenderer } from 'vue-server-renderer';
import { IRenderer, IRendererOptions, IRequestContext } from './interfaces';

export class Renderer implements IRenderer {
  private vue: BundleRenderer;
  private templates: {
    spa: string;
    ssr: string;
  };

  constructor(bundle: any, options: IRendererOptions) {
    this.templates = options.templates;
    delete options.templates;

    this.vue = createBundleRenderer(
      bundle,
      merge(
        {
          cache: lruCache({
            max: 1000,
            maxAge: 1000 * 60 * 15,
          }),
          runInNewContext: false,
        },
        options || {},
      ),
    );
  }

  public render(context: IRequestContext): Promise<string> {
    return this.vue.renderToString(context);
  }

  public async renderSSRPage(body: string, context: IRequestContext) {
    let head = '';
    let bodyAttrs = '';
    let htmlAttrs = 'data-vue-meta-server-rendered ';

    // Add Vuex and components data
    body += `<script data-vue-ssr-data>window.__DATA__=${jsonEncode(context.data || {})}</script>`;

    // Body additions
    if (typeof context.bodyAdd === 'string') {
      body += context.bodyAdd;
    }

    /**
     * Handle vue-meta
     */
    if (context.meta) {
      const metas = context.meta.inject();

      bodyAttrs += metas.bodyAttrs.text();
      htmlAttrs += metas.htmlAttrs.text();

      // Inject metas to head
      head =
        metas.meta.text() +
        metas.title.text() +
        metas.link.text() +
        metas.style.text() +
        metas.script.text() +
        metas.noscript.text();
    }

    // Build head
    if (context.headAdd) {
      head += context.headAdd;
    }

    // Handle styles
    head += context.renderStyles();

    // Resource hints
    head += context.renderResourceHints();

    // Build body
    body += context.renderScripts();

    // Replace final html
    const result = this.templates.ssr
      .replace(/data-html-attrs(="")?/i, htmlAttrs)
      .replace(/data-body-attrs(="")?/i, bodyAttrs)
      .replace(/<ssr-head\s*\/?>/i, head)
      .replace(/(<div id="?app"?><\/div>|<ssr-body\s*\/?>)/i, body)
      .replace(/<\/ssr-head>/i, '')
      .replace(/<\/ssr-body>/i, '');

    return result;
  }

  public async renderSPAPage() {
    return this.templates.spa.replace(/<ssr-head\s*\/?>/i, '').replace(
      /(<div id="?app"?><\/div>|<ssr-body\s*\/?>)/i,
      `<div id="app"></div>
        <script data-vue-spa>window.__SPA_ROUTE__=true;</script>`,
    );
  }
}
