import serveStatic from 'serve-static';

export default {
  beforeStart(app) {
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
