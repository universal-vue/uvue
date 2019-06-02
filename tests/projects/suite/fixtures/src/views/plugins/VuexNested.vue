<template>
  <div>
    <h2>Nested route</h2>

    <h3 class="code">asyncData()</h3>
    <test-case
      expected="nested"
      :result="$store.state.vuexPluginNested"
    />

  </div>
</template>

<script>
import { promiseData } from '@/shared/utils';

export default {
  async asyncData({ store }) {
    const value = await promiseData('nested');
    store.commit('setVuexPluginNested', value);
  },
};
</script>
