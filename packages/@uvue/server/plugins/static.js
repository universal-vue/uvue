import serveStatic from 'serve-static';

export default {
  install(server, pluginOptions = {}) {
    const { options: opts, directory } = {
      directory: 'dist',
      options: {},
      ...pluginOptions,
    };

    if (server.getApp().__isKoa) {
      server.use(require('koa-static')(directory, opts));
    } else {
      server.use(serveStatic(directory, opts));
    }
  },
};
