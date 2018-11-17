import serveStatic from 'serve-static';

export default {
  install(server, pluginOptions = {}) {
    const { options: opts, directory } = {
      directory: 'dist',
      options: {},
      ...pluginOptions,
    };
    server.use(serveStatic(directory, opts));
  },
};
