import UVue from '@uvue/core';
import getContext from '../lib/getContext';

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
  beforeCreate(context) {
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

    context.router.beforeEach(async (to, from, next) => {
      const ctx = getContext(context, to);
      const middlewares = [...this.$options.middlewares, ...this.getComponentsMiddlewares(ctx)];
      for (const m of middlewares) {
        if (typeof m === 'function') {
          await m(ctx);
        }
      }
      next();
    });
  },

  /**
   * Get middlewares defined on pages components
   */
  getComponentsMiddlewares(context) {
    let middlewares = [];

    // Get middlewares from routes metas
    const { route } = context;
    if (route && route.matched) {
      for (const routeItem of route.matched) {
        if (routeItem.meta && routeItem.meta.middlewares) {
          if (Array.isArray(routeItem.meta.middlewares)) {
            middlewares = [...middlewares, ...routeItem.meta.middlewares];
          } else if (typeof routeItem.meta.middlewares === 'function') {
            const result = routeItem.meta.middlewares();
            if (result && Array.isArray(result)) {
              middlewares = [...middlewares, ...result];
            }
          }
        }
      }
    }

    return middlewares;
  },
};
