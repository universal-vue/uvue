<template>
  <div>
    <test-case
      :expected="value"
      :result="result"
    />
  </div>
</template>

<script>
import { promiseData } from '@/shared/utils';

export default {
  props: {
    value: {
      type: String,
      default: '',
    },
  },

  data: () => ({
    result: '',
  }),

  async prefetch() {
    this.result = await promiseData(this.value);
  },
};
</script>
