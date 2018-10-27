<template>
  <div class="page">
    <h1><span class="code">data()</span></h1>

    <test-case
      expected="bar"
      :result="foo"
    />

    <router-view/>
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: `data()`,
      meta: [{ vmid: 'desc', name: 'description', content: this.foo }],
    };
  },

  data: () => ({
    foo: 'bar',
  }),
};
</script>

<style scoped>
h1 {
  position: relative;
}
</style>

