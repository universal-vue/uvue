<template>
  <div class="page">
    <h1>Plugin init</h1>

    <h3>Plugin options</h3>
    <test-case
      expected="bar"
      :result="$hooksTest.options.foo"
    />

    <h3>Inject to root</h3>
    <test-case
      expected="true"
      :result="$root.$options.hooksInstalled.toString()"
    />

  </div>
</template>
