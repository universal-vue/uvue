const SSRMiniCssExtractPlugin = require('./plugins/SSRMiniCssExtractPlugin');

module.exports = (api, chainConfig, isClient) => {
  // CSS rules names
  const preProcessors = ['css', 'postcss', 'scss', 'sass', 'less', 'stylus'];

  const cssConfig = api.uvue.getConfig('css');
  const normalTypes = ['normal', 'normal-modules'];
  const vueTypes = ['vue', 'vue-module'];

  const shadowMode = !!process.env.VUE_CLI_CSS_SHADOW_MODE;
  const { sourceMap = false } = api.service.projectOptions.css || {};

  // Normal CSS
  if (cssConfig.normal !== 'extract') {
    for (const lang of preProcessors) {
      for (const type of normalTypes) {
        const rule = chainConfig.module.rule(lang).oneOf(type);
        if (rule.uses.has('extract-css-loader')) {
          rule.uses.delete('extract-css-loader');
          // Inline CSS
          rule
            .use('vue-style-loader')
            .loader('vue-style-loader')
            .options({
              sourceMap,
              shadowMode,
            })
            .before('css-loader');
        }
      }
    }
  }

  // Vue SFC CSS
  if (cssConfig.vue === 'extract') {
    if (!isClient) {
      for (const lang of preProcessors) {
        for (const type of vueTypes) {
          const rule = chainConfig.module.rule(lang).oneOf(type);
          if (rule.uses.has('extract-css-loader')) {
            rule.uses.delete('extract-css-loader');
            // Critical CSS
            rule
              .use('extract-null')
              .loader(SSRMiniCssExtractPlugin.loader)
              .before('css-loader');
          }
        }
      }
      chainConfig.plugins.get('extract-css').use(SSRMiniCssExtractPlugin);
    }
  } else {
    for (const lang of preProcessors) {
      for (const type of vueTypes) {
        const rule = chainConfig.module.rule(lang).oneOf(type);
        if (rule.uses.has('extract-css-loader')) {
          rule.uses.delete('extract-css-loader');
          // Critical CSS
          rule
            .use('vue-style-loader')
            .loader('vue-style-loader')
            .options({
              sourceMap,
              shadowMode,
            })
            .before('css-loader');
        }
      }
    }
  }
};
