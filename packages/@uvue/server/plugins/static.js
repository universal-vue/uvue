import serveStatic from 'serve-static';

export default {
  install(app) {
    const { options, directory } = this.$options;
    app.use(
      serveStatic(directory, {
        ...{
          index: false,
        },
        ...options,
      }),
    );
  },
};
