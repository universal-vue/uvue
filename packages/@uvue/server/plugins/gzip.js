import compression from 'compression';

export default {
  install(app) {
    app.use(compression(this.$options));
  },
};
