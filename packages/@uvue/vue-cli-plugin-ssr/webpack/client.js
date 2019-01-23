// const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const VueSSRClientPlugin = require('./plugins/VueSSRClientPlugin');
const ModernModePlugin = require('./plugins/ModernModePlugin');

module.exports = (api, chainConfig) => {
  const uvueDir = api.uvue.getServerConfig('uvueDir');

  // Change main entry
  chainConfig.entryPoints
    .get('app')
    .clear()
    .add(require.resolve('@uvue/core/client'));

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

  return api.resolveWebpackConfig(chainConfig);
};
