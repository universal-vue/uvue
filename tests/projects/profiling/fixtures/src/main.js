import Vue from 'vue';
import App from './App.vue';
import createRouter from './router';
import createStore from './store';

Vue.config.productionTip = false;

export default () => {
  return new Vue({
    router: createRouter(),
    store: createStore(),
    render: h => h(App),
  });
};
