export default {
  middlewares: () => [
    async ({ store }) => {
      store.commit('setMiddlewareFromPlugin', 'bar');
    },
  ],
};
