// import Vue from 'vue';
import getContext from '../lib/getContext';
import sanitizeComponent from '../lib/sanitizeComponent';

const noopData = () => ({});

/**
 * Get components with asyncData defined
 */
const getAsyncDataComponents = (components = []) => {
  return components
    .map(component => {
      return sanitizeComponent(component);
    })
    .filter(Component => (Component.options.asyncData ? true : false));
};

/**
 * This will take all pages components in current route and
 * call and apply asyncData on them
 */
const resolveComponentsAsyncData = (context, route, components) => {
  const { router } = context;
  if (!route) route = router.currentRoute;
  if (!components) components = router.getMatchedComponents(route);

  return Promise.all(
    getAsyncDataComponents(components).map(async Component => {
      const data = await Component.options.asyncData(context);
      if (data) applyAsyncData(Component, data);
      return data;
    }),
  );
};

/**
 * Method to inject asyncData results to $data on component
 */
const applyAsyncData = (Component, asyncData) => {
  const ComponentData = Component.options.data || noopData;

  if (!asyncData) {
    return;
  }

  Component.options.hasAsyncData = true;
  Component.options.data = function() {
    const data = ComponentData.call(this);
    return { ...data, ...asyncData };
  };
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
    if (process.client && window.__DATA__ && window.__DATA__.components) {
      const asyncDataComponents = getAsyncDataComponents(
        router.getMatchedComponents(router.currentRoute),
      );

      for (const index in asyncDataComponents) {
        if (window.__DATA__.components[index]) {
          applyAsyncData(asyncDataComponents[index], window.__DATA__.components[index]);
        }
      }
    }
  },

  /**
   * Attach HMR behavior on route ready
   */
  ready(context) {
    addHotReload(getContext(context));
  },
};
