<template>
  <div>
    <h2>Nested route</h2>

    <test-case
      expected="nested"
      :result="bar"
    />

  </div>
</template>

<script>
export default {
  data: () => ({
    bar: 'nested',
  }),
};
</script>

