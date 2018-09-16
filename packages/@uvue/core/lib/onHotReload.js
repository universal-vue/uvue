/**
 * Listen for HMR and execute callback
 */
export default callback => {
  if (process.client && module.hot) {
    module.hot.addStatusHandler(status => {
      if (status === 'idle') callback();
    });
  }
};
