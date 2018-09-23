import serveStatic from 'serve-static';

export default {
  install(app) {
    this.$options = {
      directory: 'dist',
      options: {},
      ...(this.$options || {}),
    };

    const { options, directory } = this.$options;
    app.use(serveStatic(directory, options));
  },
};
