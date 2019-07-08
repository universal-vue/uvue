import Vue from 'vue';
import ServerMixin from './server';
import ClientMixin from './client';

export default {
  beforeCreate({ isClient }) {
    if (!Vue.__UVUE_PREFETCH_MIXIN__) {
      if (isClient) {
        Vue.mixin(ClientMixin);
      } else {
        Vue.mixin(ServerMixin);
      }
      Vue.__UVUE_PREFETCH_MIXIN__ = true;
    }
  },
};
