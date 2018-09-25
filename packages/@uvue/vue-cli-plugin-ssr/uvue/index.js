// ESM module for Node
// eslint-disable-next-line
require = require('esm')(module);

// Imports
const path = require('path');
const fs = require('fs-extra');
const { merge, get } = require('lodash');
const webpack = require('webpack');
const defineOptions = require('../webpack/defineOptions');
const UVuePlugin = require('../webpack/uvue/plugin');

/**
 * UVue API for Vue CLI
 */
module.exports = class {
  /**
   * Constructor
   * @param {*} api Keep a reference of Vue CLI API
   */
  constructor(api) {
    this.api = api;

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
        .test([/(@|\.)uvue/, this.getMainPath()])
        .use('uvue-loader')
        .loader('@uvue/vue-cli-plugin-ssr/webpack/uvue/loader.js')
        .options({
          api,
        });
    });

    // Core package need to be transpiled
    api.service.projectOptions.transpileDependencies.push(/@uvue(\\|\/)core/);
  }

  /**
   * Get absolute path to project
   */
  getProjectPath() {
    return this.api.service.context;
  }

  /**
   * Get absolute path to main
   */
  getMainPath() {
    return path.join(this.getProjectPath(), this.getConfig('paths.main'));
  }

  /**
   * Get config data or variable from uvue.config.js
   */
  getConfig(selector) {
    let config = require('./uvueConfig')();

    // Load config in project if exists
    const configPath = this.api.resolve('uvue.config.js');
    if (fs.existsSync(configPath)) {
      const module = require(configPath);
      config = merge(config, module.default || module);
      // For HMR
      delete require.cache[configPath];
    }

    // Imports
    const imports = [];
    for (let item of config.imports) {
      // Convert import string to object with options
      if (typeof item === 'string') {
        item = {
          src: item,
          ssr: true,
        };
      }

      // Get plugin absolute path
      item.src = this.resolveImportPath(item.src);

      imports.push(item);
    }
    config.imports = imports;

    if (selector) return get(config, selector);
    return config;
  }

  /**
   * Get config data or variable from server.config.js
   */
  getServerConfig(selector) {
    let config = require('./serverConfig')();

    // Load config in project if exists
    const configPath = this.api.resolve('server.config.js');
    if (fs.existsSync(configPath)) {
      const module = require(configPath);
      config = merge(config, module.default || module);
    }

    // Plugins
    const plugins = [];
    for (let item of config.plugins) {
      // Convert plugin string to object with options
      if (typeof item === 'string') {
        item = [item];
      }

      // Get plugin absolute path
      item[0] = this.resolveImportPath(item[0]);

      plugins.push(item);
    }
    config.plugins = plugins;

    if (selector) return get(config, selector);
    return config;
  }

  /**
   * Install server plugins
   */
  installServerPlugins(server) {
    const plugins = this.getServerConfig('plugins') || [];
    for (const plugin of plugins) {
      const [src, options] = plugin;

      const module = require(src);
      server.addPlugin(module.default || module, options);
    }
  }

  resolveImportPath(filepath) {
    if (/^\./.test(filepath)) {
      return this.api.resolve(filepath);
    }
    return filepath;
  }
};
