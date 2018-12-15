<template>
  <div class="page">
    <h1>Error in route</h1>

    <test-case
      expected="bar"
      :result="foo"
    />

    <pre class="error">{{ $errorHandler }}</pre>
  </div>
</template>

<script>
import { promiseData } from '@/shared/utils';

export default {
  data: () => ({
    foo: 'bar',
  }),

  async asyncData({ error }) {
    error('Forbidden', 403);
    return {
      foo: await promiseData('error'),
    };
  },

  beforeRouteUpdate(to, from, next) {
    this.$error.clear();
    next();
  },

  beforeRouteLeave(to, from, next) {
    this.$error.clear();
    next();
  },
};
</script>

