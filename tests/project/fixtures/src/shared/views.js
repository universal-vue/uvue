import Home from '@/views/Home.vue';

export default [
  {
    label: 'Basics',
    children: [
      {
        path: '/',
        name: 'home',
        label: 'Home',
        component: Home,
      },
      {
        path: '/data',
        testName: 'data',
        label: 'Data',
        component: () => import('@/views/Data.vue'),
        children: [
          {
            path: '',
            name: 'data',
            component: () => import('@/views/DataNested.vue'),
          },
        ],
      },
      {
        path: '/server-route-error',
        name: 'server-route-error',
        label: 'Route error',
        component: () => import('@/views/ServerRouteError.vue'),
      },
    ],
  },
  {
    label: 'Core',
    children: [
      {
        path: '/plugins-install',
        name: 'plugins-install',
        label: 'Plugins install',
        component: () => import('@/views/core/Install.vue'),
      },
      {
        path: '/plugins-hooks/:foo',
        testPath: '/plugins-hooks/bar?bar=baz',
        name: 'plugins-hooks',
        label: 'Plugins hooks',
        component: () => import('@/views/core/Hooks.vue'),
      },
      {
        path: '/plugins-route-error/:foo',
        testPath: '/plugins-route-error/bar?bar=baz',
        name: 'plugins-route-error',
        label: 'Plugins route error',
        component: () => import('@/views/core/RouteError.vue'),
      },
      {
        path: '/redirect',
        name: 'redirect',
        label: 'Redirect',
        component: () => import('@/views/core/Redirect.vue'),
      },
      {
        path: '/redirect-route',
        name: 'redirect-route',
        label: 'Redirect route',
        component: () => import('@/views/core/RedirectRoute.vue'),
      },
    ],
  },
  {
    label: 'Core plugins',
    children: [
      {
        path: '/plugin-vuex',
        label: 'Vuex',
        testName: 'plugin-vuex',
        component: () => import('@/views/plugins/Vuex.vue'),
        children: [
          {
            path: '',
            name: 'plugin-vuex',
            component: () => import('@/views/plugins/VuexNested.vue'),
          },
        ],
      },
      {
        path: '/plugin-async-data',
        label: 'Async Data',
        testName: 'plugin-async-data',
        component: () => import('@/views/plugins/AsyncData.vue'),
        children: [
          {
            path: '',
            name: 'plugin-async-data',
            component: () => import('@/views/plugins/AsyncDataNested.vue'),
          },
        ],
      },
      {
        path: '/plugin-middlewares',
        label: 'Middlewares',
        testName: 'plugin-middlewares',
        component: () => import('@/views/plugins/Middlewares.vue'),
        children: [
          {
            path: '',
            name: 'plugin-middlewares',
            component: () => import('@/views/plugins/MiddlewaresNested.vue'),
          },
        ],
      },
    ],
  },
];
