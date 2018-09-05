import compression from 'compression';

export default {
  install(app, options = {}) {
    this.options = options;
  },

  beforeStart(app) {
    app.use(compression(this.options));
  },
};
