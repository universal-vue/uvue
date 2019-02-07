<template>
  <div class="page">
    <h1><span class="code">serverPrefetch()</span></h1>

    <h3>Native</h3>
    <test-case
      expected="bar"
      :result="foo"
    />

    <h3>SSR Promise component</h3>
    <SsrPromise
      :promise="load('bar')"
      v-slot="{ result }"
    >
      <test-case
        expected="bar"
        :result="result"
      />
    </SsrPromise>

    <router-view/>
  </div>
</template>

<script>
import { promiseData } from '@/shared/utils';
import { SsrPromise } from '@uvue/core';

export default {
  components: {
    SsrPromise,
  },

  head() {
    return {
      title: `serverPrefetch()`,
    };
  },

  data: () => ({
    foo: '',
  }),

  async serverPrefetch() {
    this.foo = await promiseData('bar');
  },

  async mounted() {
    if (!this.foo) {
      this.foo = await promiseData('bar');
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

