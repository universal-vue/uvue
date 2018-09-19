import { promiseData } from './utils';

export const global = async context => {
  const { store } = context;
  store.commit('setMiddlewareGlobal', await promiseData('bar'));
};

export const route = async context => {
  const { store } = context;
  store.commit('setMiddlewareRoute', await promiseData('bar'));
};

export const routeNested = async context => {
  const { store } = context;
  store.commit('setMiddlewareNested', await promiseData('bar'));
};
