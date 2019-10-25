<template>
  <div class="page">
    <h1>Dev page</h1>

    Date: {{ foo }}
  </div>
</template>

<script>
import { promiseData } from '@/shared/utils';

export default {
  name: 'dev',
  serverCacheKey: () => 'dev',

  head() {
    return {
      title: `Dev page`,
    };
  },

  data: () => ({
    foo: '',
  }),

  async prefetch() {
    this.foo = await promiseData(new Date().toISOString());
  },
};
</script>

<style scoped>
h1 {
  position: relative;
}
</style>

