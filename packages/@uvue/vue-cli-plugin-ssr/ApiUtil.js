const fs = require('fs-extra');
const { merge, get } = require('lodash');
const path = require('path');


module.exports = class {
  constructor(api) {
    this.api = api;
  }
  resolveImportPath(filepath) {
    if (/^\./.test(filepath)) {
      return this.api.resolve(filepath);
    }
    return filepath;
  }
  /**
   * Get absolute path to main
   */
  getMainPath() {
    return path.join(this.getProjectPath(), this.getConfig('paths.main'));
  }
  /**
   * Get absolute path to project
   */
  getProjectPath() {
    return this.api.service.context;
  }

  /**
   * Get config data or variable from uvue.config.js
   */
  getConfig(selector) {
    let config = require('./uvue/uvueConfig')();

    // Load config in project if exists
    const configPath = path.join(this.getProjectPath(), 'uvue.config.js');
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
    let config = require('./uvue/serverConfig')();

    // Load config in project if exists
    const configPath = this.api.resolve('server.config.js');
    if (fs.existsSync(configPath)) {
      const module = require(configPath);
      config = merge(config, module.default || module);
      // For HMR
      delete require.cache[configPath];
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

      const m = require(src);
      server.addPlugin(m.default || m, options);
    }
  }
};

