import UVue from '@uvue/core';
import getContext from './getContext';
import { doRedirect, RedirectError } from '@uvue/core/lib/redirect';

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
      if (process.client && next) {
        context.app.$emit('router.redirect');
        next(error.location);
        return;
      } else {
        doRedirect(context, error);
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line
        console.error(error);
      }

      // Call hooks if there is an error
      await UVue.invokeAsync('routeError', routeContext, error);
    }
  }

  // If inside navigation guard
  if (next) next();
};
