<template>
  <div>
    <test-case
      :expected="value"
      :result="result"
    />
  </div>
</template>

<script>
import { SsrMixin } from '@uvue/core';
import { promiseData } from '@/shared/utils';

export default {
  mixins: [SsrMixin],

  props: {
    value: {
      type: String,
      default: 'bar',
    },
  },

  data: () => ({
    result: null,
  }),

  async prefetch() {
    console.log('prefetch');
    this.result = await promiseData('bar');
  },
};
</script>
