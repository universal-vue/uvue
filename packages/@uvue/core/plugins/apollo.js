import 'isomorphic-fetch';
import Vue from 'vue';
import ApolloSSR from 'vue-apollo/ssr';

export default {
  beforeCreate({ isServer }) {
    if (isServer) Vue.use(ApolloSSR);
  },

  async sendSSRData({ app, ssr, error, isServer }) {
    if (isServer) {
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
