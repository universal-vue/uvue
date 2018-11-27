import { KoaAdapter } from '@uvue/server';

export default {
  install(server, options = {}) {
    if (process.env.NODE_ENV === 'production') {
      const adapter = server.getAdapter();
      if (adapter instanceof KoaAdapter) {
        server.use(require('koa-compress')(options));
      } else {
        server.use(require('compression')(options));
      }
    }
  },
};
