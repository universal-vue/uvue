export default {
  middlewares: [
    async ({ store }) => {
      store.commit('middlewareFromPlugin', 'bar');
    },
  ],
};
