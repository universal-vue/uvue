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
];
