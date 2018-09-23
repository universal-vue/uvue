import shrinkRay from 'shrink-ray-current';

export default {
  install(app) {
    this.$options = { ...(this.$options || {}) };
    app.use(shrinkRay(this.$options));
  },
};
