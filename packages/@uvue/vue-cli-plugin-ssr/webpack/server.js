const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = (api, chainConfig) => {
  const { uvueDir, externalsWhitelist } = api.uvue.getServerConfig();

  // Change entry point
  chainConfig.entryPoints
    .get('app')
    .clear()
    .add(require.resolve('@uvue/core/lib/server'));

  // Only include Vue SSR plugin in legacy mode
  if (!process.env.VUE_CLI_MODERN_MODE || !process.env.VUE_CLI_MODERN_BUILD) {
    // Add Vue SSR plugin
    chainConfig
      .plugin('vue-ssr-plugin')
      .use(VueSSRServerPlugin, [{ filename: `${uvueDir}/server-bundle.json` }]);
  }

  // Server needs
  chainConfig
    .target('node')
    .devtool(process.env.NODE !== 'production' ? undefined : 'cheap-eval-source-map')
    .externals(
      nodeExternals({
        whitelist: [].concat(
          [/\.css$/, /\?vue&type=style/],
          api.service.projectOptions.transpileDependencies || [],
          externalsWhitelist || [],
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
            // No need to regenerator on node
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

  // Remove TS types checks plugin
  if (chainConfig.plugins.has('fork-ts-checker')) {
    chainConfig.plugins.delete('fork-ts-checker');
  }

  const config = api.resolveWebpackConfig(chainConfig);

  // Change cache folder for server side
  for (const rule of config.module.rules) {
    if (rule.use) {
      for (const item of rule.use) {
        const cachedLoaders = ['cache-loader', 'babel-loader', 'vue-loader', 'ts-loader'];

        for (const loaderName of cachedLoaders) {
          if (!item.options) continue;

          if (item.loader === loaderName || item.loader.includes(loaderName)) {
            if (item.options.cacheDirectory && !/-server$/.test(item.options.cacheDirectory)) {
              item.options.cacheIdentifier += '-server';
              item.options.cacheDirectory += '-server';
            }

            if (loaderName === 'vue-loader') {
              item.options.optimizeSSR = true;
            }
          }
        }
      }
    }
  }

  // Force entry path
  config.entry.app = [require.resolve('@uvue/core/lib/server')];

  return config;
};
