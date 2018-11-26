import cookieParser from 'cookie-parser';
import consola from 'consola';

export default {
  install(server, pluginOptions = {}) {
    if (!server.getApp().__isKoa) {
      const { secret, options: opts } = {
        secret: '',
        options: {},
        ...pluginOptions,
      };

      if (!secret) {
        consola.warn('No secret defined for your cookies!');
      }

      server.use(cookieParser(secret, opts));
    }
  },
};
