import UVue from '@uvue/core';
import sanitizeComponent from '../lib/sanitizeComponent';

export default {
  /**
   * Fetch middlewares from plugin options and other
   * installed plugins
   */
  beforeCreate() {
    this.$options = {
      middlewares: [],
      ...this.$options,
    };

    // Get global middlewares from others plugins
    for (const plugin of UVue.plugins) {
      if (typeof plugin.middlewares === 'function') {
        const middlewares = plugin.middlewares.bind(plugin)();
        if (middlewares && Array.isArray(middlewares)) {
          this.$options.middlewares = [...this.$options.middlewares, ...middlewares];
        }
      }
    }
  },

  /**
   * On each route call middlewares
   */
  async routeResolve(context) {
    const middlewares = [...this.$options.middlewares, ...this.getComponentsMiddlewares(context)];
    for (const m of middlewares) {
      await m(context);
    }
  },

  /**
   * Get middlewares defined on pages components
   */
  getComponentsMiddlewares(context) {
    const { routeComponents } = context;
    // Get pages components
    if (routeComponents.length) {
      return routeComponents
        .map(c => {
          const Component = sanitizeComponent(c);
          const { middlewares } = Component.options;

          if (middlewares && Array.isArray(middlewares)) {
            return middlewares;
          }
          return [];
        })
        .reduce((middlewares, results) => {
          results = [...results, ...middlewares];
          return results;
        }, []);
    }
    return [];
  },
};
