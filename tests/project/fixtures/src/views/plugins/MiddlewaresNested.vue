<template>
  <div>
    <h2>Nested route</h2>

    <test-case
      expected="bar"
      :result="$store.state.middlewareRouteNested"
    />
  </div>
</template>

<script>
import { routeNested } from '@/shared/middlewares';

export default {
  middlewares: [routeNested],
};
</script>
