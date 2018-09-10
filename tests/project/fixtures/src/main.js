import Vue from 'vue';
import App from './App.vue';
import createRouter from './router';

Vue.config.productionTip = false;

export default () => {
  const router = createRouter();

  return new Vue({
    router,
    render: h => h(App),
  });
};
