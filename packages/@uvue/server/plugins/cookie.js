import cookieParser from 'cookie-parser';
import consola from 'consola';

export default {
  install(app, pluginOptions = {}) {
    const { secret, options: opts } = {
      secret: '',
      options: {},
      ...pluginOptions,
    };

    if (!secret) {
      consola.warn('No secret defined for your cookies!');
    }

    app.use(cookieParser(secret, opts));
  },
};
