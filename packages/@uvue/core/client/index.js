import Vue from 'vue';
import { getVueOptions } from '../main';
import routeProcess from '../lib/routeProcess';

// Enable HMR
if (module.hot) {
  module.hot.accept();
}

/**
 * Vue start
 */
(async () => {
  // Get Vue options from project
  const options = getVueOptions();
  const { router, store } = options;

  // Create context object
  const context = {
    router,
    store,
  };

  // Create Vue app
  context.app = new Vue(options);

  // On route resolve
  router.beforeResolve(async (to, from, next) => {
    await routeProcess(context, { to, from, next });
  });

  // On router ready
  router.onReady(async () => {
    // Handle SPA mode or route
    if (!process.ssr || window.__SPA_ROUTE__) {
      await routeProcess(context);
    }

    console.log('ready and mount');

    // Mount app
    context.app.$mount('#app');
  });
})();
