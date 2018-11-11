/**
 * Main UVue object to install and call plugins
 */
export default {
  plugins: [],

  /**
   * Method to install a plugin
   */
  use(plugin, options) {
    const exists = this.plugins.indexOf(plugin);
    if (exists >= 0) {
      // Uninstall previous plugin (HMR)
      this.plugins.splice(exists, 1);
    }

    // Install hook plugin
    if (typeof plugin.install === 'function') {
      plugin.install(options);
    }

    this.plugins.push(plugin);
  },

  /**
   * Call hooks
   */
  invoke(name, ...args) {
    for (const plugin of this.plugins) {
      if (typeof plugin[name] === 'function') {
        plugin[name].bind(plugin)(...args);
      }
    }
  },

  /**
   * Call async hooks
   */
  async invokeAsync(name, ...args) {
    for (const plugin of this.plugins) {
      if (typeof plugin[name] === 'function') {
        await plugin[name].bind(plugin)(...args);
      }
    }
  },
};
