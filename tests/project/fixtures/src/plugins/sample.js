import UVue from '@uvue/core';

UVue.use(
  {
    beforeCreate(context, inject) {
      // console.log(context);
      // console.log(this.$options);
    },
  },
  { foo: 'bar' },
);
