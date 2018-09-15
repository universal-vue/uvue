import Vue from 'vue';
import UVue from '../';

/**
 * Simple function to create main context with
 * some vue options and invoke beforeCreate() hook
 * before main component creation
 */
export default (options, context) => {
  // Build context from Vue options
  context.router = options.router;

  // Get current route on context
  const route = context.router.currentRoute;
  context.route = route;
  context.params = route.params;
  context.query = route.query;
  if (!context.url) {
    context.url = route.fullPath;
  }

  // beforeCreate hook call
  UVue.callHook('beforeCreate', context, (key, value) => {
    if (!options[key]) options[key] = value;
  });

  // Create app and return it
  context.app = new Vue(options);

  return context.app;
};
