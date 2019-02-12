import onHotReload from '@uvue/core/lib/onHotReload';

export default {
  name: 'Prefetch',

  props: {
    promise: {
      type: [Function, Promise],
      required: true,
    },
  },

  data: () => ({
    state: {
      settled: false,
      pending: false,
      result: null,
      error: null,
    },
  }),

  serverPrefetch() {
    return this.resolve().then(() => {
      const { data } = this.$context.ssr;
      if (!data.prefetchComponents) {
        data.prefetchComponents = [];
      }

      data.prefetchComponents.push(this.state);
    });
  },

  created() {
    if (process.client) {
      if (window.__DATA__ && window.__DATA__.prefetchComponents) {
        this.state = window.__DATA__.prefetchComponents.shift();
      }

      if (!this.state.settled) {
        this.resolve();
      }
    }
  },

  mounted() {
    if (process.dev) {
      onHotReload(() => {
        this.$nextTick(() => {
          this.resolve();
        });
      }, `prefetch-components--${this._uid}`);
    }
  },

  render() {
    return this.$scopedSlots.default(this.state);
  },

  methods: {
    async resolve() {
      const promise = typeof this.promise === 'function' ? this.promise() : this.promise;

      this.settled = false;
      this.state.pending = true;
      try {
        this.state.result = await promise;
      } catch (err) {
        this.state.error = err;
      } finally {
        this.settled = true;
        this.state.pending = false;
      }
    },
  },
};
