// import Vue from 'vue';
import getContext from '../lib/getContext';
import sanitizeComponent from '../lib/sanitizeComponent';

const noopData = () => ({});

/**
 * This will take all pages components in current route and
 * call and apply asyncData on them
 */
export const resolveComponentsAsyncData = (context, route, components) => {
  const { router } = context;
  if (!route) route = router.currentRoute;
  if (!components) components = router.getMatchedComponents(route);

  return Promise.all(
    components.map(component => {
      const Component = sanitizeComponent(component);
      if (Component.options.asyncData) {
        return getComponentAsyncData(Component, {
          ...context,
          route,
          params: route.params,
        }).then(data => {
          if (data) applyAsyncData(Component, data);
          return data;
        });
      }
    }),
  );
};

/**
 * Simply call asyncData on component and attach data to it
 */
const getComponentAsyncData = async (Component, context) => {
  let value;
  if (Component.options.asyncData) {
    value = await Component.options.asyncData({
      ...context,
    });
  }
  return value;
};

/**
 * Method to inject asyncData results to $data on component
 */
export const applyAsyncData = (Component, asyncData) => {
  const ComponentData = Component.options.data || noopData;

  if (!asyncData || Component.options.hasAsyncData) {
    return;
  }

  Component.options.hasAsyncData = true;
  Component.options.data = function() {
    const data = ComponentData.call(this);
    return { ...data, ...asyncData };
  };

  if (Component.extendOptions) {
    Component.extendOptions.__DATA__ = asyncData;
  }
};

/**
 * Get page components in a tree of components
 */
const findAsyncDataComponents = (parent, components = []) => {
  for (const child of parent.$children) {
    if (child.$vnode.data.routerView) {
      components.push(child);
    }
    if (child.$children.length) {
      findAsyncDataComponents(child, components);
    }
  }
  return components;
};

/**
 * Attach HMR behavior on components to re-apply asyncData
 */
const addHotReload = context => {
  if (!module.hot || !process.client) return;

  const { app, router } = context;
  const components = findAsyncDataComponents(app);

  for (const depth in components) {
    const component = components[depth];
    const _forceUpdate = component.$forceUpdate.bind(component.$parent);

    component.$vnode.context.$forceUpdate = async () => {
      const routeComponents = router.getMatchedComponents(router.currentRoute);
      const Component = sanitizeComponent(routeComponents[depth]);

      try {
        if (Component && Component.options.asyncData) {
          const data = await Component.options.asyncData(getContext(context));
          applyAsyncData(Component, data);
        }
      } catch (err) {
        component.$error(err);
      }

      return _forceUpdate();
    };
  }
};

/**
 * asynData plugin
 */
export default {
  /**
   * Attach HMR behavior on route changes
   */
  beforeStart(context) {
    const { app, router } = context;

    router.afterEach(() => {
      app.$nextTick(() => {
        addHotReload(context);
      });
    });
  },

  /**
   * On each route resolve call asyncData on components
   */
  async routeResolve(context) {
    const { ssr, route, routeComponents } = context;

    const components = await resolveComponentsAsyncData(context, route, routeComponents);

    if (process.server) {
      ssr.data.components = components;
    }
  },

  async beforeReady({ router }) {
    if (process.client && window.__DATA__.components) {
      const components = router.getMatchedComponents(router.currentRoute);
      components.map((component, index) => {
        const Component = sanitizeComponent(component);
        if (Component.options.asyncData && window.__DATA__.components[index]) {
          applyAsyncData(Component, window.__DATA__.components[index]);
        }
      });

      window.__DATA__.components = null;
    }
  },

  /**
   * Attach HMR behavior on route ready
   */
  ready(context) {
    addHotReload(getContext(context));
  },
};
