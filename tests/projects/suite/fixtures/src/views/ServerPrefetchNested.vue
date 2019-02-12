<template>
  <div>
    <h2>Nested route</h2>

    <h3>Native</h3>
    <test-case
      expected="nested-native"
      :result="foo"
    />

    <h3>Renderless component</h3>
    <Prefetch
      :promise="load('nested-renderless')"
      v-slot="{ result }"
    >
      <test-case
        expected="nested-renderless"
        :result="result"
      />
    </Prefetch>

    <h3>Mixin</h3>
    <PrefetchComponent value="nested-mixin"/>

  </div>
</template>

<script>
import { promiseData } from '@/shared/utils';
import { Prefetch } from '@uvue/core';
import PrefetchComponent from '../components/PrefetchComponent.vue';

export default {
  components: {
    Prefetch,
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

  methods: {
    load: value => () => promiseData(value),
  },
};
</script>

<style scoped>
h1 {
  position: relative;
}
</style>

