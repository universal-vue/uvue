import Vue from 'vue';
import UVue from '@uvue/core';
import { doRedirect, getRedirect, RedirectError } from '@uvue/core/lib/redirect';

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

  // beforeCreate hook call
  UVue.invoke(
    'beforeCreate',
    context,
    (key, value) => {
      if (!options[key]) options[key] = value;
    },
    { ...options },
  );

  // Create app and return it
  context.app = new Vue(options);

  // Catch redirect in router
  context.router.onError(err => {
    if (err instanceof RedirectError) {
      doRedirect(context, err);
    }
  });

  return context.app;
};
