import Vue from 'vue';
import { IncomingMessage, ServerResponse } from 'http';
import VueRouter from 'vue-router';

const analyzeContext = (context, hookName) => {
  const result = {};

  for (const key in context) {
    const value = context[key];

    switch (key) {
      case 'app':
        result[key] = value instanceof Vue;
        break;

      case 'req':
        result[key] = value instanceof IncomingMessage;
        break;

      case 'res':
        result[key] = value instanceof ServerResponse;
        break;

      case 'ssr':
        result[key] = value.data != undefined;
        break;

      case 'router':
        result[key] = value instanceof VueRouter;
        break;
    }
  }

  result.redirect = typeof context.redirect === 'function';
  result.route = {
    hook: hookName,
    url: context.url,
    query: context.query,
    params: context.params,
  };

  return result;
};

export default {
  install(options) {
    this.$options = options;

    this.vm = new Vue({
      data: () => ({
        install: true,
        beforeCreate: false,
        beforeStart: false,
        routeResolve: false,
        routeError: false,
        beforeReady: false,
        ready: false,
        options: this.$options,
        contexts: {},
      }),
    });
  },

  beforeCreate(context, inject) {
    this.vm.$data.beforeCreate = true;

    inject('hooksInstalled', true);
    Vue.prototype.$hooksTest = this.vm;
    this.vm.$data.contexts.beforeCreate = analyzeContext(context);

    const { router, redirect } = context;
    router.beforeEach((to, from, next) => {
      if (/redirect-nav/.test(to.path)) {
        redirect('/');
      }
      next();
    });
  },

  async beforeStart(context) {
    this.vm.$data.beforeStart = true;
    this.vm.$data.contexts.beforeStart = analyzeContext(context);
  },

  async routeResolve(context) {
    this.vm.$data.routeResolve = true;
    this.vm.$data.contexts.routeResolve = analyzeContext(context, 'routeResolve');

    const { url } = context;

    if (/plugins-route-error/.test(url)) {
      throw new Error('RouteError');
    }
  },

  async routeError(context, error) {
    this.vm.$data.routeError = true;
    this.vm.$data.contexts.routeError = analyzeContext(context, 'routeError');
  },

  async beforeReady(context) {
    this.vm.$data.beforeReady = true;
    this.vm.$data.contexts.beforeReady = analyzeContext(context);
  },

  ready(context) {
    this.vm.$data.ready = true;
    this.vm.$data.contexts.ready = analyzeContext(context);
  },
};
