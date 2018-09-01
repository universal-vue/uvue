import Vue from 'vue';

const noopData = () => ({});

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

const getComponentAsyncData = async (Component, context) => {
  let value;
  if (Component.options.asyncData) {
    value = await Component.options.asyncData({
      ...context,
    });
    Component.__DATA__ = value;
  }
  return value;
};

// From Nuxt
export const sanitizeComponent = Component => {
  // If Component already sanitized
  if (Component.options && Component._Ctor === Component) {
    return Component;
  }
  if (!Component.options) {
    Component = Vue.extend(Component); // fix issue #6
    Component._Ctor = Component;
  } else {
    Component._Ctor = Component;
    Component.extendOptions = Component.options;
  }
  // For debugging purpose
  if (!Component.options.name && Component.options.__file) {
    Component.options.name = Component.options.__file;
  }
  return Component;
};

// From Nuxt
export const applyAsyncData = (Component, asyncData) => {
  const ComponentData = Component.options.data || noopData;

  if (!asyncData && Component.options.hasAsyncData) {
    return;
  }

  Component.options.hasAsyncData = true;
  Component.options.data = function() {
    const data = ComponentData.call(this);
    return { ...data, ...asyncData };
  };

  if (Component._Ctor && Component._Ctor.options) {
    Component._Ctor.options.data = Component.options.data;
  }

  if (Component.extendOptions) {
    Component.extendOptions.__DATA__ = asyncData;
  }
};

if (process.client) {
  Vue.mixin({
    created() {
      if (process.ssr) {
        if (this.$router && window.__DATA__) {
          const matched = this.$router.getMatchedComponents();
          if (!matched.length) return;

          matched.forEach((component, i) => {
            const Component = sanitizeComponent(component);
            if (Component.extendOptions && window.__DATA__.components[i]) {
              Component.extendOptions.__DATA__ = window.__DATA__.components[i];
            }
          });
          window.__DATA__ = null;
        }
      }

      const Ctor = this.constructor;
      if (Ctor.extendOptions && Ctor.extendOptions.asyncData) {
        for (const key in Ctor.extendOptions.__DATA__) {
          this[key] = Ctor.extendOptions.__DATA__[key];
        }
      }
    },
  });
}
