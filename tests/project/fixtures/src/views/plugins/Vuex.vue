<template>
  <div class="page">
    <h1>Vuex</h1>

    <h2 class="code">fetch()</h2>
    <test-case
      expected="bar"
      :result="result"
    />

    <h2 class="code">onHttpRequest()</h2>
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
