<template>
  <div class="page">
    <h1>Prefetch plugin</h1>

    <test-case
      expected="foo"
      :result="value"
    />

    <sub-prefetch
      expect="sub"
    />

    <router-view/>
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
    this.value = await promiseData('foo');
  },
};
</script>
