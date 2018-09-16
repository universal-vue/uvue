import Vue from 'vue';
import { IncomingMessage, ServerResponse } from 'http';
import UVue from '@uvue/core';
import VueRouter from 'vue-router';

const analyzeContext = context => {
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
    url: context.url,
    query: context.query,
    params: context.params,
  };

  return result;
};

const HooksPlugin = {
  beforeCreate(context, inject) {
    this.vm = new Vue({
      data: () => ({
        beforeCreate: true,
        beforeStart: false,
        routeResolve: false,
        routeError: false,
        beforeReady: false,
        ready: false,
        options: this.$options,
        contexts: {},
      }),
    });

    inject('hooksInstalled', true);
    Vue.prototype.$hooksTest = this.vm;
    this.vm.$data.contexts.beforeCreate = analyzeContext(context);
  },

  async beforeStart(context) {
    this.vm.$data.beforeStart = true;
    this.vm.$data.contexts.beforeStart = analyzeContext(context);
  },

  async routeResolve(context) {
    this.vm.$data.routeResolve = true;
    this.vm.$data.contexts.routeResolve = analyzeContext(context);

    const { url, redirect } = context;

    if (url === '/plugins-route-error/bar?bar=baz') {
      throw new Error('RouteError');
    } else if (url === '/redirect-route') {
      redirect('/');
    }
  },

  async routeError(error, context) {
    this.vm.$data.routeError = true;
    this.vm.$data.contexts.routeError = analyzeContext(context);
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

UVue.use(HooksPlugin, {
  foo: 'bar',
});
