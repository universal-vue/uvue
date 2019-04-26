import { createApp } from '@uvue/core/main';
import UVue, { routeResolve, onHotReload, catchErrorAsync, catchError } from '@uvue/core';

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
  await createApp(context);

  // Get some vars from context
  const { app, router } = context;

  // On router ready
  router.onReady(async () => {
    // Router resolve route
    router.beforeResolve((to, from, next) => {
      routeResolve(context, { to, from, next });
    });

    // Call beforeStart hook
    await catchErrorAsync(context, async () => {
      await UVue.invokeAsync('beforeStart', context);
    });

    // SPA mode or route
    if (!process.ssr || window.__SPA_ROUTE__) {
      await routeResolve(context);
    }

    // beforeReady hook
    await catchErrorAsync(context, async () => {
      await UVue.invokeAsync('beforeReady', context);
    });

    // Mount app
    app.$mount('#app');

    // Wait for next tick after mount
    app.$nextTick(() => {
      // Call ready hook
      catchError(context, () => {
        UVue.invoke('ready', context);
      });
    });
  });

  // Handle HMR
  onHotReload(() => {
    routeResolve(context);
  }, 'routeResolve');
})();
