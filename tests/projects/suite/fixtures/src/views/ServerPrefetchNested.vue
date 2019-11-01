<template>
  <div>
    <h2>Nested route</h2>

    <test-case
      expected="nested-native"
      :result="foo"
    />

  </div>
</template>

<script>
import { promiseData } from '@/shared/utils';
import PrefetchComponent from '../components/PrefetchComponent.vue';

export default {
  components: {
    PrefetchComponent,
  },

  data: () => ({
    foo: '',
  }),

  async serverPrefetch() {
    this.foo = await promiseData('nested-native');
  },

  async mounted() {
    if (!this.foo) {
      this.foo = await promiseData('nested-native');
    }
  },
};
</script>

<style scoped>
h1 {
  position: relative;
}
</style>

