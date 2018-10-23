import 'isomorphic-fetch';
import ApolloSSR from 'vue-apollo/ssr';
import Vue from 'vue';

if (process.server) {
  Vue.use(ApolloSSR);
}

export default {
  async routeResolve({ app, ssr, route, store, error, routeComponents }) {
    if (process.server) {
      try {
        await ApolloSSR.prefetchAll(app.$apolloProvider, [...routeComponents], {
          route,
          store,
        });
        ssr.bodyAdd = `<script>window.__APOLLO_STATE__=${JSON.stringify(
          ApolloSSR.getStates(app.$apolloProvider),
        )}</script>`;
      } catch (err) {
        error(err);
      }
    }
  },
};
