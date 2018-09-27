import Vue from 'vue';
import Vuex from 'vuex';
import getData from '@/getData';

Vue.use(Vuex);

export default () => {
  return new Vuex.Store({
    state: () => ({
      foo: null,
      middleware: null,
      init: null,
    }),
    mutations: {
      setFoo(state, value) {
        state.foo = value;
      },
      setMiddleware(state, value) {
        state.middleware = value;
      },
      setInit(state, value) {
        state.init = value;
      },
    },
    actions: {
      async onHttpRequest({ commit }, { url }) {
        if (url === '/on-http-request' || url === '/all') {
          commit('setInit', await getData('bar'));
        }
      },
    },
  });
};
