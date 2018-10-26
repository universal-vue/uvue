import cookieParser from 'cookie-parser';
import consola from 'consola';

export default {
  install(app) {
    this.$options = {
      secret: '',
      options: {},
      ...(this.$options || {}),
    };

    const { secret, options } = this.$options;

    if (!secret) {
      consola.warn('No secret defined for your cookies!');
    }

    app.use(cookieParser(secret, options));
  },
};
