import UVue from '@uvue/core';
import sanitizeComponent from '../lib/sanitizeComponent';

export default {
  /**
   * Install with options
   */
  install(options) {
    this.$options = options;
  },

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
      } else if (Array.isArray(plugin.middlewares)) {
        this.$options.middlewares = [...this.$options.middlewares, ...plugin.middlewares];
      }
    }
  },

  /**
   * On each route call middlewares
   */
  async routeResolve(context) {
    const middlewares = [...this.$options.middlewares, ...this.getComponentsMiddlewares(context)];
    for (const m of middlewares) {
      if (typeof m === 'function') {
        await m(context);
      }
    }
  },

  /**
   * Get middlewares defined on pages components
   */
  getComponentsMiddlewares(context) {
    const { routeComponents } = context;
    let middlewares = [];

    // Get middlewares from routes metas
    const { route } = context;
    if (route && route.matched) {
      for (const routeItem of route.matched) {
        if (routeItem.meta && routeItem.meta.middlewares) {
          if (Array.isArray(route.meta.middlewares)) {
            middlewares = [...middlewares, ...route.meta.middlewares];
          } else if (typeof route.meta.middlewares === 'function') {
            const result = route.meta.middlewares();
            if (result && Array.isArray(result)) {
              middlewares = [...middlewares, ...result];
            }
          }
        }
      }
    }

    // Get middlewares from pages components
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
        }, middlewares);
    }
    return middlewares;
  },
};
