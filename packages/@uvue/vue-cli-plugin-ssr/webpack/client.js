// const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const VueSSRClientPlugin = require('./plugins/VueSSRClientPlugin');
const ModernModePlugin = require('./plugins/ModernModePlugin');

module.exports = (api, chainConfig, { hmr }) => {
  const uvueDir = api.uvue.getServerConfig('uvueDir');

  // Change main entry
  chainConfig.entryPoints
    .get('app')
    .clear()
    .add(require.resolve('@uvue/core/lib/client'));

  // Add Vue SSR plugin
  let clientManifestFilename = `${uvueDir}/client-manifest.json`;

  // Modern build
  if (process.env.VUE_CLI_MODERN_MODE) {
    if (!process.env.VUE_CLI_MODERN_BUILD) {
      clientManifestFilename = `${uvueDir}/legacy-manifest.json`;

      // Use ModernModePlugin to update SPA template
      chainConfig.plugin('modern-mode-legacy').use(ModernModePlugin, [
        {
          targetDir: api.service.projectOptions.outputDir,
          isModernBuild: false,
        },
      ]);
    } else {
      // Use ModernModePlugin to update SPA template
      chainConfig.plugin('modern-mode-modern').use(ModernModePlugin, [
        {
          targetDir: api.service.projectOptions.outputDir,
          isModernBuild: true,
        },
      ]);
    }
  }

  // Vue SSR plugin
  chainConfig.plugin('vue-ssr-plugin').use(VueSSRClientPlugin, [
    {
      filename: clientManifestFilename,
    },
  ]);

  if (hmr) {
    chainConfig.devtool('cheap-module-eval-source-map');

    chainConfig.plugin('hmr').use(require('webpack/lib/HotModuleReplacementPlugin'));

    // https://github.com/webpack/webpack/issues/6642
    // https://github.com/vuejs/vue-cli/issues/3539
    chainConfig.output.globalObject(`(typeof self !== 'undefined' ? self : this)`);
  }

  return api.resolveWebpackConfig(chainConfig);
};
