import cookieParser from 'cookie-parser';

export default {
  beforeStart(app) {
    const { secret, options } = this.$options;
    app.use(cookieParser(secret, options));
  },
};
