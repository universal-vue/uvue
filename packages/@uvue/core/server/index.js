import { createApp } from '../main';

/**
 * Vue start
 */
export default ssr => {
  // Create context object
  const context = { ssr };

  // Send router to server side
  ssr.router = router;

  // Call app main
  createApp(context);

  // Get some vars from context
  const { app, router } = context;

  // Init router with current URL
  router.push(ssr.url);

  // On router ready
  return new Promise(resolve => {
    router.onReady(async () => {
      resolve(app);
    });
  });
};
