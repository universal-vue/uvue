/**
 * Main UVue object to install and call plugins
 */
export default {
  plugins: [],

  /**
   * Method to install a plugin
   */
  use(plugin, options) {
    plugin.$options = options;
    this.plugins.push(plugin);
  },

  /**
   * Call hooks
   */
  callHook(name, ...args) {
    for (const plugin of this.plugins) {
      if (typeof plugin[name] === 'function') {
        plugin[name].bind(plugin)(...args);
      }
    }
  },

  /**
   * Call async hooks
   */
  async callAsyncHook(name, ...args) {
    for (const plugin of this.plugins) {
      if (typeof plugin[name] === 'function') {
        await plugin[name].bind(plugin)(...args);
      }
    }
  },
};
