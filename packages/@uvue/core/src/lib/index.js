import Vue from 'vue';
import UVue from './UVue';
import getContext from './getContext';
import initApp from './initApp';
import onHotReload from './onHotReload';
import routeResolve from './routeResolve';
import sanitizeComponent from './sanitizeComponent';

Vue.__UVUE__ = true;

export { UVue, getContext, initApp, onHotReload, routeResolve, sanitizeComponent };
export * from './catchError';
export * from './redirect';
export default UVue;
