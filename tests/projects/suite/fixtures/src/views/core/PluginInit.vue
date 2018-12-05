<template>
  <div class="page">
    <h1>Plugin init</h1>

    <h3>Plugin options</h3>
    <test-case
      expected="bar"
      :result="$hooksTest.options.foo"
    />

  </div>
</template>
