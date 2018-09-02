import Vue from 'vue';
import { getVueOptions } from '../main';

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

  // On router ready
  router.onReady(async () => {
    // Mount app
    context.app.$mount('#app');
  });
})();
