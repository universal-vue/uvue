import serveStatic from 'serve-static';

export default {
  install(app, pluginOptions = {}) {
    const { options: opts, directory } = {
      directory: 'dist',
      options: {},
      ...pluginOptions,
    };
    app.use(serveStatic(directory, opts));
  },
};
