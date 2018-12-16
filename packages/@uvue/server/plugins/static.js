import { KoaAdapter } from '@uvue/server';
import merge from 'lodash/merge';

export default {
  install(server, pluginOptions = {}) {
    const adapter = server.getAdapter();

    if (adapter instanceof KoaAdapter) {
      const { options: opts, directory } = merge(
        {},
        {
          directory: 'dist',
          options: {
            gzip: false,
            maxage: 30 * 24 * 60 * 60 * 1000,
            setHeaders(res, path) {
              if (/service-worker\.js/.test(path)) {
                res.setHeader('Cache-Control', 'public, max-age=0');
              }
            },
          },
        },
        pluginOptions,
      );

      server.use(require('koa-static')(directory, opts));
    } else {
      const { options: opts, directory } = merge(
        {},
        {
          directory: 'dist',
          options: {
            dotfiles: 'ignore',
            immutable: true,
            maxAge: '30d',
            setHeaders(res, path) {
              if (/service-worker\.js/.test(path)) {
                res.setHeader('Cache-Control', 'public, max-age=0');
              }
            },
          },
        },
        pluginOptions,
      );

      server.use(require('serve-static')(directory, opts));
    }
  },
};
