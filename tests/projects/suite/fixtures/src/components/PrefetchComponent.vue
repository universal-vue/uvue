<template>
  <div>
    <test-case
      :expected="value"
      :result="result"
    />
  </div>
</template>

<script>
import { PrefetchMixin } from '@uvue/core';
import { promiseData } from '@/shared/utils';

export default {
  mixins: [PrefetchMixin],

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
