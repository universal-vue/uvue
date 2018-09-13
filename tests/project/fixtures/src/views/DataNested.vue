<template>
  <div>
    <h2>Nested route</h2>

    <test-case
      expected="baz"
      :result="bar"
    />

  </div>
</template>

<script>
export default {
  data: () => ({
    bar: 'baz',
  }),
};
</script>

