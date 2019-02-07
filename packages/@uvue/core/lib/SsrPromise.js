import onHotReload from '@uvue/core/lib/onHotReload';

export default {
  props: {
    promise: {
      type: [Function, Promise],
      required: true,
    },
  },

  data: () => ({
    settled: false,
    state: {
      pending: false,
      result: null,
      error: null,
    },
  }),

  serverPrefetch() {
    return this.resolve().then(() => {
      const { data } = this.$context.ssr;
      if (!data.ssrPromise) {
        data.ssrPromise = [];
      }

      data.ssrPromise.push(this.state);
    });
  },

  created() {
    if (process.client && window.__DATA__.ssrPromise) {
      this.state = window.__DATA__.ssrPromise.shift();
    }
  },

  mounted() {
    if (!this.settled) {
      this.resolve();
    }

    if (process.dev) {
      onHotReload(() => {
        this.$nextTick(() => {
          this.resolve();
        });
      }, `ssr-promise--${this._uid}`);
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
