import { createApp } from '../main';
import routeResolve from '../lib/routeResolve';

/**
 * Vue start
 */
export default async ssr => {
  // Create context object
  const context = { ssr };

  // Send router to server side
  ssr.router = router;

  // Call app main
  createApp(context);

  // Get some vars from context
  const { app, router } = context;

  // Router resolve route
  router.beforeResolve((to, _, next) => {
    routeResolve(context, { to, next });
  });

  // Init router with current URL
  router.push(ssr.url);

  // On router ready
  return new Promise(resolve => {
    router.onReady(async () => {
      resolve(app);
    });
  });
};
