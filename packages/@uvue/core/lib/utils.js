// Call callback when HMR detected
export const onHotReload = callback => {
  if (process.client && module.hot) {
    module.hot.addStatusHandler(status => {
      if (status === 'idle') callback();
    });
  }
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
