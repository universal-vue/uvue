<template>
  <div>{{ foo }}</div>
</template>

<script>
export default {
  computed: {
    foo() {
      return this.$store.state.init;
    },
  },
};
</script>

