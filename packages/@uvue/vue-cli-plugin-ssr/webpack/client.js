const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const ModernModePlugin = require('@vue/cli-service/lib/webpack/ModernModePlugin');

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

  // Modern build
  if (process.env.VUE_CLI_MODERN_MODE) {
    if (!process.env.VUE_CLI_MODERN_BUILD) {
      // Inject plugin to extract build stats and write to disk
      chainConfig.plugin('modern-mode-legacy').use(ModernModePlugin, [
        {
          targetDir: api.service.projectOptions.outputDir,
          isModernBuild: false,
        },
      ]);
    } else {
      chainConfig.plugin('modern-mode-modern').use(ModernModePlugin, [
        {
          targetDir: api.service.projectOptions.outputDir,
          isModernBuild: true,
        },
      ]);
    }
  }

  return api.resolveWebpackConfig(chainConfig);
};
