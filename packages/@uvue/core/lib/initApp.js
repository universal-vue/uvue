import Vue from 'vue';
import UVue from '@uvue/core';

/**
 * Simple function to create main context with
 * some vue options and invoke beforeCreate() hook
 * before main component creation
 */
export default (options, context) => {
  // Build context from Vue options
  context.router = options.router;

  // beforeCreate hook call
  UVue.invoke('beforeCreate', context, (key, value) => {
    if (!options[key]) options[key] = value;
  });

  // Create app and return it
  context.app = new Vue(options);

  return context.app;
};
