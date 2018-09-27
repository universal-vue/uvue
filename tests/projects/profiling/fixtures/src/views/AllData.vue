<template>
  <div>
    <div>asynData(): {{ asyncData }}</div>
    <div>fetch(): {{ fetch }}</div>
    <div>onHttpRequest(): {{ onHttpRequest }}</div>
    <div>middleware: {{ middleware }}</div>
  </div>
</template>

<script>
import getData from '@/getData';

export default {
  middlewares: [
    async ({ store }) => {
      store.commit('setMiddleware', await getData('bar'));
    },
  ],

  async asyncData() {
    return {
      asyncData: await getData('bar'),
    };
  },

  async fetch({ store }) {
    store.commit('setFoo', await getData('bar'));
  },

  computed: {
    fetch() {
      return this.$store.state.foo;
    },
    onHttpRequest() {
      return this.$store.state.init;
    },
    middleware() {
      return this.$store.state.middleware;
    },
  },
};
</script>

