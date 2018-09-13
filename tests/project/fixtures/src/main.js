import './assets/styles.css';
import Vue from 'vue';
import App from './App.vue';
import createRouter from './router';
import TestCase from './components/TestCase.vue';

Vue.config.productionTip = false;

Vue.component('test-case', TestCase);

export default () => {
  const router = createRouter();

  return new Vue({
    router,
    render: h => h(App),
  });
};
