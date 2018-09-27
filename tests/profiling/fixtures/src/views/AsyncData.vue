<template>
  <div>{{ foo }}</div>
</template>

<script>
import getData from '@/getData';

export default {
  async asyncData() {
    return {
      foo: await getData('bar'),
    };
  },
};
</script>

