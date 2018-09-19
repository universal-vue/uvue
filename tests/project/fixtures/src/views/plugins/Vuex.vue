<template>
  <div class="page">
    <h1>Vuex</h1>

    <h3 class="code">fetch()</h3>
    <test-case
      expected="bar"
      :result="$store.state.vuexPlugin"
    />

    <h3 class="code">onHttpRequest()</h3>
    <test-case
      expected="bar"
      :result="$store.state.initData"
    />

    <router-view/>
  </div>
</template>

<script>
import { promiseData } from '@/shared/utils';

export default {
  async fetch({ store }) {
    const value = await promiseData('bar');
    store.commit('setVuexPlugin', value);
  },
};
</script>
