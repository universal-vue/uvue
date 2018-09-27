<template>
  <div class="page">
    <h1>Error handler</h1>

    <button
      class="set-error"
      @click="triggerError"
    >
      Set error
    </button>

    <button
      class="clear-error"
      @click="clearError"
    >
      Clear error
    </button>

    <pre class="error">{{ $errorHandler }}</pre>

  </div>
</template>

<script>
export default {
  methods: {
    triggerError() {
      this.$error(new Error('!'));
    },
    clearError() {
      this.$error.clear();
    },
  },
};
</script>
