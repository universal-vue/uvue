import serveStatic from 'serve-static';

export default {
  beforeStart(app) {
    this.options = Object.assign(
      {
        index: false,
      },
      this.options,
    );
    app.use('/', serveStatic(this.filesDirectory, this.options));
  },
};
