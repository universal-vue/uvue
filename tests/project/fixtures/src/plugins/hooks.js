import Vue from 'vue';
import UVue from '@uvue/core';

const analyzeContext = context => {
  const result = {};
  for (const key in context) {
    result[key] = typeof context[key];

    if (typeof context[key] === 'string') {
      result[key] = context[key];
    }
  }
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

    const { url } = context;

    if (url === '/plugins-route-error') {
      throw new Error('RouteError');
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
