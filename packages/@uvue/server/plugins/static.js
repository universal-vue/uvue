import { KoaAdapter } from '@uvue/server';

export default {
  install(server, pluginOptions = {}) {
    const { options: opts, directory } = {
      directory: 'dist',
      options: {},
      ...pluginOptions,
    };

    const adapter = server.getAdapter();
    if (adapter instanceof KoaAdapter) {
      server.use(require('koa-static')(directory, opts));
    } else {
      server.use(require('serve-static')(directory, opts));
    }
  },
};
