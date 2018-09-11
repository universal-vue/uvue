import compression from 'compression';

export default {
  beforeStart(app) {
    app.use(compression(this.$options));
  },
};
