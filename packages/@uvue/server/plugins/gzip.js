import compression from 'compression';

export default {
  install(server, options = {}) {
    if (process.env.NODE_ENV === 'production') {
      if (server.getApp().__isKoa) {
        server.use(require('koa-compress')(options));
      } else {
        server.use(compression(options));
      }
    }
  },
};
