<template>
  <div>
    <h2>Nested route</h2>

    <h3>Native</h3>
    <test-case
      expected="nested"
      :result="foo"
    />

    <h3>Renderless component</h3>
    <SsrPromise
      :promise="load('nested')"
      v-slot="{ result }"
    >
      <test-case
        expected="nested"
        :result="result"
      />
    </SsrPromise>

    <h3>Mixin</h3>
    <SsrComponent value="nested"/>

  </div>
</template>

<script>
import { promiseData } from '@/shared/utils';
import { SsrPromise } from '@uvue/core';
import SsrComponent from '../components/SsrComponent.vue';

export default {
  components: {
    SsrPromise,
    SsrComponent,
  },

  data: () => ({
    foo: '',
  }),

  async serverPrefetch() {
    this.foo = await promiseData('nested');
  },

  async mounted() {
    if (!this.foo) {
      this.foo = await promiseData('nested');
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

