import onHotReload from './onHotReload';

export default {
  data: () => ({
    $ssrPrefetched: false,
  }),

  async serverPrefetch() {
    if (this.$options.prefetch) {
      await this.$options.prefetch.bind(this)();

      const { data } = this.$context.ssr;
      if (!data.ssrPrefetch) {
        data.ssrPrefetch = [];
      }

      data.ssrPrefetch.push({
        ...this.$data,
        $ssrPrefetched: true,
      });
    }
  },

  async created() {
    if (process.client && window.__DATA__.ssrPrefetch) {
      const data = window.__DATA__.ssrPrefetch.shift();
      if (data) {
        for (const key in data) {
          this[key] = data[key];
        }
      }

      if (!this.$ssrPrefetched && this.$options.prefetch) {
        await this.$options.prefetch.bind(this)();
      }
    }
  },

  async mounted() {
    if (process.dev) {
      onHotReload(() => {
        this.$nextTick(() => {
          this.$options.prefetch.bind(this)();
        });
      }, `ssr-prefetch--${this._uid}`);
    }
  },
};
