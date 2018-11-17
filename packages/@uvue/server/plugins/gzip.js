import compression from 'compression';

export default {
  install(server, options = {}) {
    server.use(compression(options));
  },
};
