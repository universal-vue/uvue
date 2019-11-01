<template>
  <div>
    <h2>Nested route</h2>

    <test-case
      expected="nested"
      :result="value"
    />

    <sub-prefetch
      expect="nested-sub"
    />
  </div>
</template>

<script>
import SubPrefetch from './SubPrefetch';
import { promiseData } from '@/shared/utils';

export default {
  components: {
    SubPrefetch,
  },

  data: () => ({
    value: null,
  }),

  async prefetch() {
    this.value = await promiseData('nested');
  },
};
</script>
