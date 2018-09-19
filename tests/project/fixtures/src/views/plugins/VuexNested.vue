<template>
  <div>
    <h2>Nested route</h2>

    <h3 class="code">fetch()</h3>
    <test-case
      expected="bar"
      :result="result"
    />

    <h3 class="code">onHttpRequest()</h3>
    <test-case
      expected="bar"
      :result="init"
    />
  </div>
</template>

<script>
import { promiseData } from '@/shared/utils';

export default {
  async fetch({ store }) {
    const value = await promiseData('bar');
    store.commit('setVuexPlugin', value);
  },

  computed: {
    result() {
      return this.$store.state.vuexPlugin;
    },

    init() {
      return this.$store.state.initData;
    },
  },
};
</script>
