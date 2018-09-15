<template>
  <div class="page">
    <h1>Hooks</h1>

    <div
      v-for="hookName in hooks"
      :key="hookName"
    >
      <h3 class="code">{{ hookName }}()</h3>
      <test-case
        expected="true"
        :result="$hooksTest[hookName].toString()"
      />
      <h4>Context</h4>
      <pre>{{ $hooksTest.contexts[hookName] }}</pre>
    </div>

  </div>
</template>

<script>
export default {
  data: () => ({
    hooks: ['beforeCreate', 'created', 'routeResolve', 'beforeReady', 'ready'],
  }),
};
</script>
