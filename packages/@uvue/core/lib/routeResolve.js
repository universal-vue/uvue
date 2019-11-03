import UVue from './UVue';
import getContext from './getContext';
import { doRedirect, RedirectError } from './redirect';

/**
 * Function called when a route is being resolved
 * Call hooks and next() if needed
 */
export default async (context, guardContext = {}) => {
  const { next } = guardContext;
  const routeContext = getContext(context, guardContext);

  try {
    // Call hooks on route resolve
    await UVue.invokeAsync('routeResolve', routeContext);
  } catch (error) {
    if (error instanceof RedirectError) {
      // Do redirect
      if (context.isClient && next) {
        context.app.$emit('router.redirect');
        next(error.location);
        return;
      } else {
        doRedirect(context, error);
      }
    } else {
      if (context.isServer && context.ssr.events) {
        const { events } = context.ssr;
        events.emit('error', {
          from: 'routeResolve',
          error,
        });
      }

      // Call hooks if there is an error
      await UVue.invokeAsync('routeError', routeContext, error);
    }
  }

  // If inside navigation guard
  if (next) next();
};
