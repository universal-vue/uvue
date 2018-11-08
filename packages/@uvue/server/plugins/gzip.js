import shrinkRay from 'shrink-ray-current';

export default {
  install(app, options = {}) {
    app.use(shrinkRay(options));
  },
};
