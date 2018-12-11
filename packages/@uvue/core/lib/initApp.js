import Vue from 'vue';
import UVue from '@uvue/core';
import { doRedirect, getRedirect, RedirectError } from '@uvue/core/lib/redirect';
import { catchError, VueError } from './catchError';

/**
 * Simple function to create main context with
 * some vue options and invoke beforeCreate() hook
 * before main component creation
 */
export default (options, context) => {
  // Build context from Vue options
  context.router = options.router;

  // Attach redirect function to context
  context.redirect = getRedirect(context);

  // Make it available on all components
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

  // beforeCreate hook call
  catchError(context, () => {
    UVue.invoke('beforeCreate', context, inject, options);
  });

  // Create app and return it
  context.app = new Vue(options);

  // Catch redirects in router nav guards
  context.router.onError(err => {
    if (err instanceof RedirectError) {
      doRedirect(context, err);
    }
  });

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

  return context.app;
};
