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
        name: 'data',
        label: 'Data',
        component: () => import('@/views/Data.vue'),
        children: [
          {
            path: '',
            name: 'data-nested',
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
        component: () => import('@/views/plugins/Install.vue'),
      },
      {
        path: '/plugins-hooks',
        name: 'plugins-hooks',
        label: 'Plugins hooks',
        component: () => import('@/views/plugins/Hooks.vue'),
      },
      {
        path: '/plugins-route-error',
        name: 'plugins-route-error',
        label: 'Plugins route error',
        component: () => import('@/views/plugins/RouteError.vue'),
      },
    ],
  },
];
