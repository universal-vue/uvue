import Vue from 'vue';
import { Store } from 'vuex';
import sanitizeComponent from '../lib/sanitizeComponent';
import onHotReload from '../lib/onHotReload';

/**
 * Vuex plugin
 */
export default {
  /**
   * Install with options
   */
  install(options) {
    this.$options = {
      fetch: false,
      onHttpRequest: true,
      ...options,
    };
  },

  /**
   * Get store from Vue options and inject it to context
   */
  beforeCreate(context, _, vueOptions) {
    if (vueOptions.store && vueOptions.store instanceof Store) {
      // Get store from new Vue options
      context.store = vueOptions.store;

      // Handle HMR
      onHotReload(() => {
        this.resolveOnHttpRequest(context, true);
      }, 'vuex.onHttpRequest');
    } else {
      Vue.utils.warn('UVue Vuex plugin installed but no store found!');
    }
  },

  /**
   * Read data from SSR to hydrate store
   */
  async beforeStart(context) {
    const { store } = context;
    if (store && process.client && process.ssr && window.__DATA__) {
      const { state } = window.__DATA__;
      store.replaceState(state);
    }

    if (!context.app._isMounted) {
      // onHttpRequest
      await this.resolveOnHttpRequest(context);
    }
  },

  /**
   * Call fetch() methods on pages components
   */
  async routeResolve(context) {
    await this.resolveFetch(context);
  },

  /**
   * Call onHttpRequest action and send data to __DATA__
   */
  sendSSRData(context) {
    const { store, ssr } = context;

    if (store && process.server) {
      // Inject store data in __DATA__ on server side
      ssr.data.state = store.state;
    }
  },

  async resolveFetch(context) {
    const { routeComponents, store } = context;

    if (store && this.$options.fetch) {
      // Get pages components
      if (routeComponents.length) {
        await Promise.all(
          routeComponents.map(c => {
            const Component = sanitizeComponent(c);
            // For each component lookup for fetch() method
            if (Component.options.fetch) {
              return Component.options.fetch(context);
            }
          }),
        );
      }
    }
  },

  async resolveOnHttpRequest(context, fromHMR = false) {
    const { store } = context;

    if (this.$options.onHttpRequest && store._actions.onHttpRequest) {
      if (process.server || !process.ssr || window.__SPA_ROUTE__ || fromHMR) {
        await store.dispatch('onHttpRequest', context);
      }
    }
  },
};
