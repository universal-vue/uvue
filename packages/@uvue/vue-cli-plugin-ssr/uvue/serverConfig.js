const path = require('path');

/**
 * Default config
 */
module.exports = () => ({
  distPath: path.resolve('dist'),
  uvueDir: 'uvue',
  adapter: null,
  adapterArgs: [],
  http2: false,
  https: {
    cert: null,
    key: null,
  },
  renderer: {
    directives: {},
    cache: undefined,
    shouldPrefetch: null,
    shouldPreload: null,
  },
  generate: {
    paths: [],
    scanRouter: true,
    params: {},
  },
  devServer: {
    middleware: {},
    hot: {},
  },
  plugins: [],
  watch: ['server.config.js'],
  watchIgnore: ['dist/**/*'],
});
