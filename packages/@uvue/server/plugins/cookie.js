import cookieParser from 'cookie-parser';

export default {
  install(app) {
    this.$options = {
      secret: '',
      options: {},
      ...(this.$options || {}),
    };

    // TODO: warn if no secret

    const { secret, options } = this.$options;
    app.use(cookieParser(secret, options));
  },
};
