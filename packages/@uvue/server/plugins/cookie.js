import cookieParser from 'cookie-parser';

export default {
  beforeStart(app) {
    app.use(cookieParser(this.secret, this.options));
  },
};
