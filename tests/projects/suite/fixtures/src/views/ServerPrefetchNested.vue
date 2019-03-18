<template>
  <div>
    <h2>Nested route</h2>

    <h3>Native</h3>
    <test-case
      expected="nested-native"
      :result="foo"
    />

    <h3>Mixin</h3>
    <PrefetchComponent value="nested-mixin"/>

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

