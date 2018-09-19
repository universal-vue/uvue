<template>
  <div class="page">
    <h1>Middlewares plugin</h1>

    <h3>Global middleware</h3>
    <test-case
      expected="bar"
      :result="$store.state.middlewareGlobal"
    />

    <h3>Route middleware</h3>
    <test-case
      expected="bar"
      :result="$store.state.middlewareRoute"
    />

    <h3>Plugin middleware</h3>
    <test-case
      expected="bar"
      :result="$store.state.middlewareFromPlugin"
    />

    <router-view/>
  </div>
</template>

<script>
import { route } from '@/shared/middlewares';

export default {
  middlewares: [route],
};
</script>
