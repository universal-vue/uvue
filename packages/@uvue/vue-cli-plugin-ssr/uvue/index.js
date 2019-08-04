// ESM module for Node
// eslint-disable-next-line
require = require('esm')(module);

// Imports
const webpack = require('webpack');
const defineOptions = require('../webpack/defineOptions');
const UVuePlugin = require('../webpack/uvue/plugin');
const ApiUtil = require('../ApiUtil');


/**
 * UVue API for Vue CLI
 */
module.exports = class {
  /**
   * Constructor
   * @param {*} api Keep a reference of Vue CLI API
   */
  constructor(api) {
    // Basic webpack conf for UVue (SPA mode)
    api.chainWebpack(chainConfig => {
      // Change main entry
      chainConfig.entryPoints
        .get('app')
        .clear()
        .add(require.resolve('@uvue/core/client'));

      // Add DefinePlugin
      chainConfig.plugin('uvue-defines').use(webpack.DefinePlugin, [defineOptions()]);

      // Add UVue webpack plugin & loader
      chainConfig.plugin('uvue-plugin').use(UVuePlugin, [{ api }]);
      chainConfig.module
        .rule('uvue-tranform')
        .test([/(@|\.)uvue/, new ApiUtil(api).getMainPath()])
        .use('uvue-loader')
        .loader('@uvue/vue-cli-plugin-ssr/webpack/uvue/loader.js')
        .options({
          api,
        });
    });

    // Core package need to be transpiled
    api.service.projectOptions.transpileDependencies.push(
      /@uvue(\\|\/)core/,
      /\.uvue(\\|\/)main\.js/,
      // PWA: register service worker module
      /register-service-worker/,
    );
  }
};
