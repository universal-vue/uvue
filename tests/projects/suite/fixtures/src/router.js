import Vue from 'vue';
import Router from 'vue-router';
import views from './shared/views';

Vue.use(Router);

export default () => {
  return new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: views.reduce((routes, category) => {
      routes.push(...category.children);
      return routes;
    }, []),
  });
};
