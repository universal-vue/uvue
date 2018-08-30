const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');

module.exports = (api, chainConfig) => {
  // Add Vue SSR plugin
  chainConfig
    .plugin('vue-ssr-plugin')
    .use(VueSSRClientPlugin, [{ filename: 'assets/client-manifest.json' }]);

  return api.resolveWebpackConfig(chainConfig);
};
