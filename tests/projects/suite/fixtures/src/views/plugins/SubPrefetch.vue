<template>
  <div>
    <test-case
      :expected="expect"
      :result="value"
    />
  </div>
</template>

<script>
import { promiseData } from '@/shared/utils';

export default {
  props: {
    expect: null,
  },

  data: () => ({
    value: null,
  }),

  async prefetch() {
    this.value = await promiseData(this.expect);
  },
};
</script>
