const fs = require('fs-extra');
const { merge, get } = require('lodash');
const webpack = require('webpack');
const defineOptions = require('../webpack/defineOptions');

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
    });

    // Core package need to be transpiled
    api.service.projectOptions.transpileDependencies.push(/@uvue(\\|\/)core/);
  }

  /**
   * Get config data or variable from uvue.config.js
   */
  getConfig(selector) {
    let config = require('./defaultConfig')();

    // Load config in project if exists
    const configPath = this.api.resolve('uvue.config.js');
    if (fs.existsSync(configPath)) {
      config = merge(config, require(configPath));
      // For HMR
      delete require.cache[configPath];
    }

    // Imports
    const imports = [];
    for (const item of config.imports) {
      // Convert import string to object with options
      if (typeof item === 'string') {
        imports.push({
          src: item,
          ssr: true,
        });
      }
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
      config = merge(config, require(configPath));
      // For HMR
      delete require.cache[configPath];
    }

    // Plugins
    const plugins = [];
    for (const item of config.plugins) {
      // Convert plugin string to object with options
      if (typeof item === 'string') {
        plugins.push({
          src: item,
          options: {},
        });
      }
    }
    config.plugins = plugins;

    if (selector) return get(config, selector);
    return config;
  }
};
