/**
 * Listen for HMR and execute callback
 */
export default (callback, name) => {
  if (process.client && module.hot) {
    if (!window.__UVUE_HMR) window.__UVUE_HMR = {};

    const hotCb = status => {
      if (status === 'idle') callback();
    };

    if (name) {
      if (window.__UVUE_HMR[name]) {
        module.hot.removeStatusHandler(window.__UVUE_HMR[name]);
      }
      window.__UVUE_HMR[name] = hotCb;
    }

    module.hot.addStatusHandler(hotCb);
  }
};
