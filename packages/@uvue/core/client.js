import { createApp } from './main';
import UVue from '@uvue/core';
import routeResolve from './lib/routeResolve';
import onHotReload from './lib/onHotReload';

// Enable HMR
if (module.hot) {
  module.hot.accept();
}

/**
 * Vue start
 */
(async () => {
  // Create context object
  const context = {
    url: window.location.pathname + window.location.search,
  };

  // Call app main
  createApp(context);

  // Get some vars from context
  const { app, router } = context;

  // On router ready
  router.onReady(async () => {
    // Router resolve route
    router.beforeResolve((to, _, next) => {
      routeResolve(context, { to, next });
    });

    // Call created hook
    await UVue.invokeAsync('beforeStart', context);

    // SPA mode or route
    if (!process.ssr || window.__SPA_ROUTE__) {
      await routeResolve(context);
    }

    // beforeReady hook
    await UVue.invokeAsync('beforeReady', context);

    // Mount app
    app.$mount('#app');

    // Wait for next tick after mount
    app.$nextTick(() => {
      // Call ready hook
      UVue.invoke('ready', context);
    });
  });

  // Handle HMR
  onHotReload(() => {
    routeResolve(context);
  }, 'routeResolve');
})();
