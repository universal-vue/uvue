import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router);

export default () => {
  return new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
      {
        path: '/',
        name: 'home',
        component: Home,
      },
      {
        path: '/async-data',
        name: 'async-data',
        component: () => import(/* webpackChunkName: "async-data" */ './views/AsyncData.vue'),
      },
      {
        path: '/vuex',
        name: 'vuex',
        component: () => import(/* webpackChunkName: "vuex" */ './views/Vuex.vue'),
      },
      {
        path: '/on-http-request',
        name: 'on-http-request',
        component: () =>
          import(/* webpackChunkName: "on-http-request" */ './views/OnHttpRequest.vue'),
      },
      {
        path: '/middleware',
        name: 'middleware',
        component: () => import(/* webpackChunkName: "middleware" */ './views/Middleware.vue'),
      },
      {
        path: '/redirect',
        name: 'redirect',
        component: () => import(/* webpackChunkName: "redirect" */ './views/Redirect'),
      },
      {
        path: '/error-handler',
        name: 'error-handler',
        component: () => import(/* webpackChunkName: "error-handler" */ './views/ErrorHandler.vue'),
      },
      {
        path: '/server-error',
        name: 'server-error',
        component: () => import(/* webpackChunkName: "server-error" */ './views/ServerError.vue'),
      },
      {
        path: '/all',
        name: 'all',
        component: () => import(/* webpackChunkName: "all" */ './views/AllData.vue'),
      },
    ],
  });
};
