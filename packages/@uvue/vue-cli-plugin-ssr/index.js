const UVueAPI = require('./uvue');

module.exports = api => {
  const { projectOptions } = api.service;

  // Install UVue API
  api.uvue = new UVueAPI(api);

  // Vue CLI commands
  require('./commands/serve')(api, projectOptions);
  require('./commands/build')(api, projectOptions);
  require('./commands/start')(api, projectOptions);
  require('./commands/fix')(api, projectOptions);
};

module.exports.defaultModes = {
  'ssr:serve': 'development',
  'ssr:build': 'production',
  'ssr:start': 'production',
};
