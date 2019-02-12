import onHotReload from './onHotReload';

export default {
  data: () => ({
    $prefetched: false,
  }),

  async serverPrefetch() {
    if (this.$options.prefetch) {
      await this.$options.prefetch.bind(this)();

      const { data } = this.$context.ssr;
      if (!data.prefetch) {
        data.prefetch = [];
      }

      data.prefetch.push({
        ...this.$data,
        $prefetched: true,
      });
    }
  },

  created() {
    if (process.client) {
      if (window.__DATA__ && window.__DATA__.prefetch) {
        const data = window.__DATA__.prefetch.shift();

        if (data) {
          for (const key in data) {
            this[key] = data[key];
          }
        }
      }

      if (!this.$prefetched && this.$options.prefetch) {
        this.$options.prefetch.bind(this)();
      }
    }
  },

  mounted() {
    if (process.dev) {
      onHotReload(() => {
        this.$nextTick(() => {
          this.$options.prefetch.bind(this)();
        });
      }, `prefetch--${this._uid}`);
    }
  },
};
