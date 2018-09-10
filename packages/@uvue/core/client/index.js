import { createApp } from '../main';

// Enable HMR
if (module.hot) {
  module.hot.accept();
}

/**
 * Vue start
 */
(async () => {
  // Create context object
  const context = {};

  // Call app main
  createApp(context);

  // Get some vars from context
  const { app, router } = context;

  // On router ready
  router.onReady(async () => {
    // Mount app
    app.$mount('#app');
  });
})();
