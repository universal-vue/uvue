const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = (api, chainConfig) => {
  // Change entry point
  chainConfig.entryPoints
    .get('app')
    .clear()
    .add(require.resolve('@uvue/core/server'));

  // Only include Vue SSR plugin in legacy mode
  if (!process.env.VUE_CLI_MODERN_MODE || !process.env.VUE_CLI_MODERN_BUILD) {
    // Add Vue SSR plugin
    chainConfig
      .plugin('vue-ssr-plugin')
      .use(VueSSRServerPlugin, [{ filename: '.uvue/server-bundle.json' }]);
  }

  // Server needs
  chainConfig
    .target('node')
    .externals(
      nodeExternals({
        whitelist: [].concat(
          [/\.css$/, /\?vue&type=style/],
          api.service.projectOptions.transpileDependencies || [],
          api.uvue.getConfig('externalsWhitelist') || [],
        ),
      }),
    )
    .output.filename('server-bundle.js')
    .libraryTarget('commonjs2');

  // Remove
  chainConfig.node.clear();
  chainConfig.optimization.splitChunks(false);
  chainConfig.performance.hints(false);
  chainConfig.performance.maxAssetSize(Infinity);
  chainConfig.plugins.delete('hmr');

  // Change babel configs
  const jsRule = chainConfig.module.rules.get('js');

  if (jsRule) {
    jsRule.uses.get('babel-loader').options({
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
  }

  // Replace Webpack Bar configuration
  chainConfig.plugin('webpack-bar').tap(() => {
    return [{ name: 'Server', color: 'orange' }];
  });

  const config = api.resolveWebpackConfig(chainConfig);

  // Change cache folder for server side
  for (const rule of config.module.rules) {
    if (rule.use) {
      for (const item of rule.use) {
        if (item.loader === 'cache-loader' || item.loader === 'vue-loader') {
          item.options.cacheIdentifier += '-server';
          item.options.cacheDirectory += '-server';

          if (item.loader === 'vue-loader') {
            item.options.optimizeSSR = true;
          }
        }
      }
    }
  }

  return config;
};
