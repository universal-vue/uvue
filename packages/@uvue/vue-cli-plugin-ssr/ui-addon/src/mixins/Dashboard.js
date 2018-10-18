export default {
  beforeCreate() {
    // Set store variable to take new modes types
    Vue.set(this.$store.state, 'ssr-build', {
      stats: null,
      analyzer: {},
    });
    Vue.set(this.$store.state, 'ssr-serve', {
      stats: null,
      analyzer: {},
    });
    Vue.set(this.$store.state, 'ssr-build-modern', {
      stats: null,
      analyzer: {},
    });
  },

  created() {
    const mode = (this.mode =
      this.TaskDetails.task.command.indexOf('vue-cli-service ssr:serve') !== -1
        ? 'ssr-serve'
        : 'ssr-build');
    this.$store.commit('mode', mode);

    if (mode === 'ssr-build') {
      this.syncMode('ssr-build-modern');
    }
    this.syncMode(mode);
  },

  watch: {
    showModernBuild: {
      immediate: true,
      handler(value) {
        const mode =
          this.TaskDetails.task.command.indexOf('vue-cli-service ssr:serve') !== -1
            ? 'ssr-serve'
            : 'ssr-build';

        if (mode === 'ssr-build') {
          if (value) {
            this.$store.commit('mode', 'ssr-build-modern');
          } else {
            this.$store.commit('mode', 'ssr-build');
          }
        }
      },
    },
  },
};
