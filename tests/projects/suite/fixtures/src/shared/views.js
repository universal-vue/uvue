import Home from '@/views/Home.vue';
import { route, routeNested } from '@/shared/middlewares';

const views = [
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
        path: '/plugins-init',
        name: 'plugins-init',
        label: 'Plugins init',
        component: () => import('@/views/core/PluginInit.vue'),
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
        path: '/plugin-prefetch',
        label: 'Prefetch',
        testName: 'plugin-prefetch',
        component: () => import('@/views/plugins/Prefetch.vue'),
        children: [
          {
            path: '',
            name: 'plugin-prefetch',
            component: () => import('@/views/plugins/PrefetchNested.vue'),
          },
        ],
      },
      {
        path: '/plugin-middlewares',
        label: 'Middlewares',
        testName: 'plugin-middlewares',
        component: () => import('@/views/plugins/Middlewares.vue'),
        meta: {
          middlewares: [route],
        },
        children: [
          {
            path: '',
            name: 'plugin-middlewares',
            component: () => import('@/views/plugins/MiddlewaresNested.vue'),
            meta: {
              middlewares: [routeNested],
            },
          },
        ],
      },
      {
        path: '/plugin-error-methods',
        label: 'Error handler (methods)',
        name: 'plugin-error-methods',
        component: () => import('@/views/plugins/ErrorMethods.vue'),
      },
      {
        path: '/plugin-error-route',
        label: 'Error handler (route)',
        name: 'plugin-error-route',
        component: () => import('@/views/plugins/ErrorRoute.vue'),
      },
    ],
  },
];

// Build SPA paths
const spaPaths = views.map(item => {
  const category = { ...item };

  category.label = `(SPA) ${category.label}`;
  category.children = category.children.map(route => {
    const spaRoute = {
      ...route,
      name: route.name !== undefined ? `spa--${route.name}` : undefined,
      testName: route.testName !== undefined ? `spa--${route.name}` : undefined,
      path: route.path !== undefined ? `/spa${route.path}` : undefined,
      testPath: route.testPath !== undefined ? `/spa${route.testPath}` : undefined,
    };

    if (spaRoute.children) {
      spaRoute.children = spaRoute.children.map(child => {
        return {
          ...child,
          name: route.name !== undefined ? `spa--${route.name}` : undefined,
          testName: route.testName !== undefined ? `spa--${route.name}` : undefined,
          path: route.path !== undefined ? `/spa${route.path}` : undefined,
          testPath: route.testPath !== undefined ? `/spa${route.testPath}` : undefined,
        };
      });
    }

    return spaRoute;
  });

  return category;
});

export default [...views, ...spaPaths];
