import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default () => {
  return new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
      // Your routes here
    ],
  });
};
