<template>
  <div class="page">
    <h1>Server route error</h1>

    <p>
      This page can not be rendered on server side.
    </p>
  </div>
</template>

<script>
export default {
  created() {
    window.console.log('Error');
  },
};
</script>
