import Vue from 'vue';
import ServerMixin from './server';
import ClientMixin from './client';

export function hasPrefetch(vm) {
  return vm.$options && typeof vm.$options.prefetch === 'function';
}

if (!Vue.__uvue_prefetch_mixin__) {
  if (process.client) {
    Vue.mixin(ClientMixin);
  } else {
    Vue.mixin(ServerMixin);
  }
  Vue.__uvue_prefetch_mixin__ = true;
}
