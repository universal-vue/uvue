import Vue from 'vue';
import Vuex from 'vuex';
import { promiseData } from './shared/utils';

Vue.use(Vuex);

export default () => {
  return new Vuex.Store({
    state: () => ({
      vuexPlugin: 'default',
      initData: 'default',
      middlewareGlobal: 'default',
      middlewareRoute: 'default',
      middlewareRouteNested: 'default',
      middlewareFromPlugin: 'default',
    }),
    mutations: {
      setVuexPlugin(state, value) {
        state.vuexPlugin = value;
      },
      setInitData(state, value) {
        state.initData = value;
      },
      setMiddlewareGlobal(state, value) {
        state.middlewareGlobal = value;
      },
      setMiddlewareRoute(state, value) {
        state.middlewareRoute = value;
      },
      setMiddlewareRouteNested(state, value) {
        state.middlewareRouteNested = value;
      },
      setMiddlewareFromPlugin(state, value) {
        state.middlewareFromPlugin = value;
      },
    },
    actions: {
      async onHttpRequest({ commit }) {
        const value = await promiseData('bar');
        commit('setInitData', value);
      },
    },
  });
};
