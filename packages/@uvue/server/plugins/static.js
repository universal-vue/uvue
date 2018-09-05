import serveStatic from 'serve-static';

export default {
  install(app, path = '/', directory = 'dist', options = {}) {
    this.path = path;
    this.directory = directory;
    this.options = options;
  },

  beforeStart(app) {
    this.options = Object.assign(
      {
        index: false,
      },
      this.options,
    );

    app.use(this.path, serveStatic(this.directory, this.options));
  },
};
