const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');

module.exports = (api, chainConfig) => {
  // Change main entry
  chainConfig.entryPoints
    .get('app')
    .clear()
    .add(require.resolve('@uvue/core/client'));

  // Add Vue SSR plugin
  chainConfig
    .plugin('vue-ssr-plugin')
    .use(VueSSRClientPlugin, [{ filename: '.uvue/client-manifest.json' }]);

  return api.resolveWebpackConfig(chainConfig);
};
