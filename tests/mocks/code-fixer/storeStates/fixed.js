export default {
  state: () => ({
    foo: 'bar',
  }),

  mutations: {
    changeFoo(state, value) {
      state.foo = value;
    },
  },
};
