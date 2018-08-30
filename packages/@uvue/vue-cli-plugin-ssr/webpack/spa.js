const webpack = require('webpack');
const defineOptions = require('./defineOptions');

module.exports = (api, returnChain = true) => {
  // Get webpack chain config
  const chainConfig = api.resolveChainableWebpackConfig();

  // Change main entry
  chainConfig.entryPoints
    .get('app')
    .clear()
    .add(require.resolve('@uvue/core/client'));

  // Add DefinePlugin
  chainConfig.plugin('uvue-defines').use(webpack.DefinePlugin, [defineOptions()]);

  if (!returnChain) return api.resolveWebpackConfig(chainConfig);
  return chainConfig;
};
