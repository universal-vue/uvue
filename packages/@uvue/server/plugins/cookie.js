import cookieParser from 'cookie-parser';

export default {
  install(app, secret, options = {}) {
    this.secret = secret;
    this.options = options;
  },

  beforeStart(app) {
    app.use(cookieParser(this.secret, this.options));
  },
};
