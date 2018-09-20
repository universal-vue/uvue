import shrinkRay from 'shrink-ray-current';

export default {
  install(app) {
    app.use(shrinkRay(this.$options));
  },
};
