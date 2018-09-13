<template>
  <div class="page">
    <h1><span class="code">data()</span></h1>

    <test-case
      expected="bar"
      :result="foo"
    />

  </div>
</template>

<script>
export default {
  data: () => ({
    foo: 'bar',
  }),
};
</script>

