import Vue from 'vue';
import UVue from './UVue';
import { doRedirect, getRedirect, RedirectError } from './redirect';
import { VueError, emitServerError, catchErrorAsync } from './catchError';

/**
 * Simple function to create main context with
 * some vue options and invoke beforeCreate() hook
 * before main component creation
 */
export default async (options, context) => {
  // Build context from Vue options
  context.router = options.router;

  // Attach redirect function to context
  context.redirect = getRedirect(context);

  // Make redirect function available in all components
  Vue.prototype.$redirect = (location, statusCode = 301) => {
    doRedirect(context, {
      location,
      statusCode,
    });
  };

  // Inject function
  const inject = (key, value) => {
    if (!/^\$/.test(key)) key = `$${key}`;
    context[key] = Vue.prototype[key] = value;
    if (options.store) {
      options.store[key] = value;
    }
  };

  // Attach context to components
  Vue.prototype.$context = context;

  // beforeCreate hook call
  await catchErrorAsync(context, async () => {
    await UVue.invokeAsync('beforeCreate', context, inject, options);
  });

  // Create app and return it
  context.app = new Vue(options);

  // Catch Vue errors
  Vue.config.errorHandler = (error, vm, info) => {
    if (error instanceof RedirectError) {
      doRedirect(context, error);
    } else {
      UVue.invoke('catchError', context, new VueError(error, vm, info));

      if (process.client) {
        if (process.env.NODE_ENV !== 'production') {
          Vue.util.warn(`Error in ${info}: "${error.toString()}"`, vm);
        } else if (process.env.VUE_APP_ENABLE_ERROR_LOGS) {
          // eslint-disable-next-line
          console.error(error.stack || error.message || error);
        }
      } else {
        throw error;
      }
    }
  };

  // created hook call
  await catchErrorAsync(context, async () => {
    await UVue.invokeAsync('created', context);
  });

  // Catch redirects in router nav guards
  context.router.onError(error => {
    if (error instanceof RedirectError) {
      doRedirect(context, error);
    } else {
      if (process.server && context.ssr.events) {
        emitServerError(context, {
          from: 'router',
          error,
        });
      }
    }
  });

  return context.app;
};
