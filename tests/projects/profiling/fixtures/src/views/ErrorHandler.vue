<template>
  <div>{{ this.$errorHandler }}</div>
</template>

<script>
import getData from '@/getData';

export default {
  async asyncData({ store }) {
    await getData(new Error('!'));
  },
};
</script>

