import foo from './foo';

new Vue({
  router,
  store,
  render: h => h(App),
});

export const store = new Vuex.Store({
  state: {},
});

export const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./Home.vue'),
    },
  ],
});

export const test = () => {};

export function test2() {}

export default ({ router, store }) => {
  return new Class({
    one: 2,
  });
};

new Class({
  one: 2,
  render: h => h(App),
});
