import Vue from 'vue';
import { getVueOptions } from '../main';

/**
 * Vue start
 */
export default ssr => {
  // Get Vue options from project
  const options = getVueOptions();
  const { router, store } = options;

  // Create context object
  const context = {
    router,
    store,
    ssr,
  };

  // Send router to server side
  ssr.router = router;

  // Create Vue app
  context.app = new Vue(options);

  // Init router with current URL
  router.push(ssr.url);

  // On router ready
  return new Promise(resolve => {
    router.onReady(async () => {
      resolve(context.app);
    });
  });
};
