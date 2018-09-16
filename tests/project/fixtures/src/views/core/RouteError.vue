<template>
  <div class="page">
    <h1 class="code">routeError()</h1>

    <test-case
      expected="true"
      :result="$hooksTest.routeError.toString()"
    />

    <h4>Context</h4>
    <pre class="context">{{ $hooksTest.contexts.routeError }}</pre>

  </div>
</template>
