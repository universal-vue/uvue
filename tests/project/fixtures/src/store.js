import Vue from 'vue';
import Vuex from 'vuex';
import { promiseData } from './shared/utils';

Vue.use(Vuex);

export default () => {
  return new Vuex.Store({
    state: () => ({
      vuexPlugin: 'default',
      initData: 'default',
    }),
    mutations: {
      setVuexPlugin(state, value) {
        state.vuexPlugin = value;
      },
      setInitData(state, value) {
        state.initData = value;
      },
    },
    actions: {
      async onHttpRequest({ commit }) {
        commit('setInitData', await promiseData('bar'));
      },
    },
  });
};
