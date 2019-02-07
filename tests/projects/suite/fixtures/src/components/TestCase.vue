<template>
  <div class="test">
    <div class="expected">
      <span class="label">Expected:</span>
      <pre class="value">{{ expected }}</pre>
    </div>

    <div class="result">
      <span class="label">Result:</span>
      <pre class="value">{{ result }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    expected: {
      type: [String, null],
      required: true,
    },
    result: {
      type: [String, null],
      required: true,
    },
  },
};
</script>
