<template>
  <div class="page">
    <h1><span class="code">data()</span></h1>

    <div class="expected">
      <span class="label">Expected:</span>
      <pre class="value">bar</pre>
    </div>

    <div class="result">
      <span class="label">Result:</span>
      <pre class="value">{{ foo }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    foo: 'bar',
  }),
};
</script>

