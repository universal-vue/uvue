<template>
  <div>{{ foo }}</div>
</template>

<script>
import getData from '@/getData';

export default {
  middlewares: [
    async ({ store }) => {
      store.commit('setMiddleware', await getData('bar'));
    },
  ],

  computed: {
    foo() {
      return this.$store.state.middleware;
    },
  },
};
</script>

