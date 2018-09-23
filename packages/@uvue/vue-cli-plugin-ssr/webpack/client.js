const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const ModernModePlugin = require('./plugins/ModernModePlugin');

module.exports = (api, chainConfig) => {
  // Change main entry
  chainConfig.entryPoints
    .get('app')
    .clear()
    .add(require.resolve('@uvue/core/client'));

  // Add Vue SSR plugin
  let clientManifestFilename = '.uvue/client-manifest.json';

  // Modern build
  if (process.env.VUE_CLI_MODERN_MODE) {
    if (!process.env.VUE_CLI_MODERN_BUILD) {
      clientManifestFilename = '.uvue/legacy-manifest.json';

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
