import cookieParser from 'cookie-parser';
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

    if (!server.getApp().__isKoa) {
      server.use(cookieParser(secret, opts));
    }
  },
};
