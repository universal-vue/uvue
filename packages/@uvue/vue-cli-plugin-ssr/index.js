const webpack = require('webpack');
const defineOptions = require('./webpack/defineOptions');

module.exports = api => {
  const { projectOptions } = api.service;

  // Basic webpack conf for UVue (SPA mode)
  api.chainWebpack(chainConfig => {
    // Change main entry
    chainConfig.entryPoints
      .get('app')
      .clear()
      .add(require.resolve('@uvue/core/client'));

    // Add DefinePlugin
    chainConfig.plugin('uvue-defines').use(webpack.DefinePlugin, [defineOptions()]);
  });

  // Core package need to be transpiled
  api.service.projectOptions.transpileDependencies.push(/@uvue(\\|\/)core/);

  // Vue CLI commands
  require('./commands/serve')(api, projectOptions);
};

module.exports.defaultModes = {
  'ssr:serve': 'development',
};
