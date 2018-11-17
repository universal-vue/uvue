import compression from 'compression';

export default {
  install(server, options = {}) {
    if (server.getApp().__isKoa) {
      server.use(require('koa-connect')(compression(options)));
    } else {
      server.use(compression(options));
    }
  },
};
