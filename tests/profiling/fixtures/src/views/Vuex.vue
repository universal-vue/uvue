<template>
  <div>{{ foo }}</div>
</template>

<script>
import getData from '@/getData';

export default {
  async fetch({ store }) {
    store.commit('setFoo', await getData('bar'));
  },

  computed: {
    foo() {
      return this.$store.state.foo;
    },
  },
};
</script>

