/**
 * This code come from Nuxt.JS: https://nuxtjs.org/
 */
import Vue from 'vue';
import { hasPrefetch } from './utils';
import { onHotReload } from '@uvue/core';

const isSsrHydration = vm =>
  vm.$vnode && vm.$vnode.elm && vm.$vnode.elm.dataset && vm.$vnode.elm.dataset.ssrKey;

export default {
  beforeCreate() {
    if (hasPrefetch(this)) {
      Vue.util.defineReactive(this, '$isFetching', false);
    }
  },
  created() {
    if (hasPrefetch(this) && isSsrHydration(this)) {
      // Hydrate component
      this._hydrated = true;
      this.$isLoading = false;
      this._lastFetchAt = Date.now();

      this._ssrKey = +this.$vnode.elm.dataset.ssrKey;
      const asyncData = window.__DATA__.prefetch[this._ssrKey] || {};

      for (const key in asyncData) {
        this[key] = asyncData[key];
      }
    }
  },
  beforeMount() {
    if (!this._hydrated && hasPrefetch(this)) {
      this.$prefetch();
    }

    onHotReload(() => {
      this.$nextTick(() => {
        if (hasPrefetch(this)) {
          this.$prefetch();
        }
      });
    }, `prefetch--${this._uid}`);
  },
  methods: {
    async $prefetch() {
      this.$isFetching = true;
      await this.$options.prefetch.call(this);
      this.$isFetching = false;
      this._lastFetchAt = Date.now();
    },
  },
};
