import { KoaAdapter } from '@uvue/server';
import { merge } from 'lodash-es';

export default {
  install(server, pluginOptions = {}) {
    const { options: opts, directory } = merge(
      {},
      {
        directory: 'dist',
        options: {
          immutable: true,
          maxAge: '1y',
          setHeaders(res, path) {
            if (/service-worker\.js/.test(path)) {
              res.setHeader('Cache-Control', 'public, max-age=0');
            }
          },
        },
      },
      pluginOptions,
    );

    const adapter = server.getAdapter();
    if (adapter instanceof KoaAdapter) {
      server.use(require('koa-static')(directory, opts));
    } else {
      server.use(require('serve-static')(directory, opts));
    }
  },
};
