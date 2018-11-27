import { KoaAdapter } from '@uvue/server';
import consola from 'consola';

export default {
  install(server, pluginOptions = {}) {
    const { secret, options: opts } = {
      secret: '',
      options: {},
      ...pluginOptions,
    };

    if (!secret) {
      consola.warn('No secret defined for your cookies!');
    }

    const adapter = server.getAdapter();
    if (adapter instanceof KoaAdapter) {
      server.getApp().keys = [secret];
    } else {
      server.use(require('cookie-parser')(secret, opts));
    }
  },
};
