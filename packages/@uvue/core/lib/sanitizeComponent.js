import Vue from 'vue';

/**
 * Sanitize component
 * From NuxtJS
 */
export default Component => {
  if (!Component) return;

  // If Component already sanitized
  if (Component.options && Component._Ctor === Component) {
    return Component;
  }
  if (!Component.options) {
    Component = Vue.extend(Component);
  } else {
    Component.extendOptions = Component.options;
  }

  Component._Ctor = Component;

  // For debugging purpose
  if (!Component.options.name && Component.options.__file) {
    Component.options.name = Component.options.__file;
  }
  return Component;
};
