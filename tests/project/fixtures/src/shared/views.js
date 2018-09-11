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
      },
    ],
  },
];
