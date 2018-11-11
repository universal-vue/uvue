import compression from 'compression';

export default {
  install(app, options = {}) {
    app.use(compression(options));
  },
};
