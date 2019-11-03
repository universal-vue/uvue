import { createApp } from '@uvue/core/main';
import { UVue, routeResolve, catchErrorAsync, catchError } from '@uvue/core';

/**
 * Vue start
 */
export default async ssr => {
  // Create context object
  const context = {
    ...ssr.inject,
    ssr,
    url: ssr.url,
    req: ssr.req,
    res: ssr.res,
    isClient: false,
    isServer: true,
  };

  // Call app main
  await createApp(context);

  // Get some vars from context
  const { app, router } = context;

  // Send router to server side
  ssr.router = router;

  // Handle VueMeta plugin
  if (typeof app.$meta === 'function') {
    ssr.meta = app.$meta();
  }

  // Init router with current URL
  router.push(ssr.url);

  // On router ready
  return new Promise((resolve, reject) => {
    router.onReady(async () => {
      // Call beforeStart hook
      await catchErrorAsync(context, async () => {
        await UVue.invokeAsync('beforeStart', context);
      });

      // Resolve current route
      await routeResolve(context);

      // Call beforeReady hook
      await catchErrorAsync(context, async () => {
        await UVue.invokeAsync('beforeReady', context);
      });

      ssr.rendered = () => {
        UVue.invoke('sendSSRData', context);
      };

      // Resolve app
      resolve(app);

      // Call ready hook
      catchError(context, () => {
        UVue.invoke('ready', context);
      });
    }, reject);
  });
};
