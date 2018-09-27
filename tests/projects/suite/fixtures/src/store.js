import Vue from 'vue';
import Vuex from 'vuex';
import { promiseData } from './shared/utils';

Vue.use(Vuex);

export default () => {
  return new Vuex.Store({
    state: () => ({
      vuexPlugin: 'default',
      vuexPluginNested: 'default',
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
      setVuexPluginNested(state, value) {
        state.vuexPluginNested = value;
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
        const value = await promiseData('onHttpRequest');
        commit('setInitData', value);
      },
    },
  });
};
