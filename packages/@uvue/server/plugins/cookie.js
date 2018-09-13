import cookieParser from 'cookie-parser';

export default {
  install(app) {
    const { secret, options } = this.$options;
    app.use(cookieParser(secret, options));
  },
};
