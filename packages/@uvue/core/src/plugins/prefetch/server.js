/**
 * This code come from Nuxt.JS: https://nuxtjs.org/
 */
import { hasPrefetch } from './utils';

function getDataDiff(o1, o2) {
  return Object.keys(o2).reduce((diff, key) => {
    if (o1[key] === o2[key]) {
      return diff;
    }
    return {
      ...diff,
      [key]: o2[key],
    };
  }, {});
}

export default {
  beforeCreate() {
    if (hasPrefetch(this)) {
      this._fetchOnServer = this.$options.fetchOnServer !== false;
      this.$isFetching = !this._fetchOnServer;
    }
  },

  async serverPrefetch() {
    if (hasPrefetch(this) && this._fetchOnServer) {
      const ssrData = this.$context.ssr.data;
      if (!ssrData.prefetch) ssrData.prefetch = [];

      const data = Object.assign({}, this.$data);

      await this.$options.prefetch.call(this);

      // Define and ssrKey for hydration
      this._ssrKey = ssrData.prefetch.length;

      // Add data-ssr-key on parent element of Component
      if (!this.$vnode.data.attrs) {
        this.$vnode.data.attrs = {};
      }
      this.$vnode.data.attrs['data-ssr-key'] = this._ssrKey;

      // Add to SSR data
      ssrData.prefetch.push(getDataDiff(data, this.$data));

      await new Promise(resolve => this.$nextTick(resolve));
    }
  },
};
