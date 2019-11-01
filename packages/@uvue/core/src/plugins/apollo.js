import 'isomorphic-fetch';
import Vue from 'vue';
import ApolloSSR from 'vue-apollo/ssr';

if (process.server) {
  Vue.use(ApolloSSR);
}

export default {
  async sendSSRData({ app, ssr, error }) {
    if (process.server) {
      try {
        ssr.bodyAdd = `<script>window.__APOLLO_STATE__=${ApolloSSR.serializeStates(
          app.$apolloProvider,
        )}</script>`;
      } catch (err) {
        error(err);
      }
    }
  },
};
