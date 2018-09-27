import './assets/styles.css';
import Vue from 'vue';
import App from './App.vue';
import VueMeta from 'vue-meta';
import createRouter from './router';
import createStore from './store';

Vue.config.productionTip = false;

Vue.use(VueMeta, {
  keyName: 'head',
});

import TestCase from './components/TestCase.vue';
Vue.component('test-case', TestCase);

export default () => {
  const router = createRouter();
  const store = createStore();

  return new Vue({
    router,
    store,
    render: h => h(App),
  });
};
