/**
 * Listen for HMR and execute callback
 */
const callbacks = {};
export default (callback, name) => {
  if (process.client && module.hot) {
    if (name) {
      if (callbacks[name]) return;
      callbacks[name] = true;
    }

    module.hot.addStatusHandler(status => {
      if (status === 'idle') callback();
    });
  }
};
