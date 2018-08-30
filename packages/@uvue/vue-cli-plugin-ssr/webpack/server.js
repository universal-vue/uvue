const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = (api, chainConfig) => {
  // Change entry point
  chainConfig.entryPoints
    .get('app')
    .clear()
    .add(require.resolve('@uvue/core/server'));

  // Add Vue SSR plugin
  chainConfig
    .plugin('vue-ssr-plugin')
    .use(VueSSRServerPlugin, [{ filename: 'assets/server-bundle.json' }]);

  // Server needs
  chainConfig
    .target('node')
    .externals(
      nodeExternals({
        whitelist: [
          /\.css$/,
          /\?vue&type=style/,
          ...api.service.projectOptions.transpileDependencies,
          // TODO: make it configurable
          // ...this.nodeExternalsWhitelist,
          // ...(this.getConfig('nodeExternalsWhitelist') || []),
        ],
      }),
    )
    .output.filename('server-bundle.js')
    .libraryTarget('commonjs2');

  // Remove
  chainConfig.node.clear();
  chainConfig.optimization.splitChunks(false);
  chainConfig.performance.hints(false);
  chainConfig.performance.maxAssetSize(Infinity);

  // Change babel configs
  chainConfig.module.rules
    .get('js')
    .uses.get('babel-loader')
    .options({
      presets: [
        [
          '@vue/app',
          {
            targets: { node: 'current' },
            // No need to regenator on node
            exclude: ['transform-regenerator'],
          },
        ],
      ],
    });

  // Replace Webpack Bar configuration
  chainConfig.plugin('webpack-bar').tap(args => {
    return [{ name: 'Server', color: 'orange' }];
  });

  const config = api.resolveWebpackConfig(chainConfig);

  // Change cache folder for server side
  for (const rule of config.module.rules) {
    if (rule.use) {
      for (const item of rule.use) {
        if (item.loader === 'cache-loader' && !client) {
          // Change cache directory for server-side
          item.options.cacheIdentifier += '-server';
          item.options.cacheDirectory += '-server';
        } else if (item.loader === 'vue-loader') {
          // Optimize SSR only on server-side
          if (client) {
            item.options.optimizeSSR = false;
          } else {
            item.options.cacheIdentifier += '-server';
            item.options.cacheDirectory += '-server';
            item.options.optimizeSSR = true;
          }
        }
      }
    }
  }

  return config;
};
