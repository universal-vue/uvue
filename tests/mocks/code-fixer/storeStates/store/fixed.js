export const state = () => ({
  foo: 'bar',
});

export const mutations = {
  changeFoo(state, value) {
    state.foo = value;
  },
};
