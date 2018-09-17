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
  head: {
    title: 'data()',
  },

  data: () => ({
    foo: 'bar',
  }),
};
</script>

