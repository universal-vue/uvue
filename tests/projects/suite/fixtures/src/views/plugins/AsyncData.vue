<template>
  <div class="page">
    <h1><span class="code">asyncData()</span> plugin</h1>

    <test-case
      expected="bar"
      :result="foo"
    />

    <router-view/>
  </div>
</template>

<script>
import { promiseData } from '@/shared/utils';

export default {
  async asyncData() {
    return {
      foo: await promiseData('bar'),
    };
  },
};
</script>

