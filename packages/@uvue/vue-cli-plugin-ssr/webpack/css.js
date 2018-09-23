const CssContextLoader = require.resolve('./plugins/CssContext');

module.exports = (api, chainConfig, isClient) => {
  // CSS rules names
  const cssRulesNames = ['css', 'postcss', 'scss', 'sass', 'less', 'stylus'];
  const oneOfsNames = ['normal', 'normal-modules', 'vue', 'vue-modules'];

  if (!api.uvue.getConfig('css.extract')) {
    for (const ruleName of cssRulesNames) {
      const rule = chainConfig.module.rules.get(ruleName);
      if (rule) {
        for (const oneOfName of oneOfsNames) {
          const oneOf = rule.oneOfs.get(oneOfName);
          if (oneOf) {
            const extractUse = oneOf.uses.get('extract-css-loader');
            if (extractUse) {
              oneOf.uses.delete('extract-css-loader');

              oneOf
                .use('vue-style-loader')
                .before('css-loader')
                .loader('vue-style-loader')
                .options({
                  sourceMap: false,
                  shadowMode: false,
                });
            }
          }
        }
      }
    }
  } else {
    // Extract CSS
    if (!isClient) {
      for (const lang of cssRulesNames) {
        for (const type of oneOfsNames) {
          const rule = chainConfig.module.rule(lang).oneOf(type);
          if (rule.uses.has('extract-css-loader')) {
            rule.uses.delete('extract-css-loader');
            // Critical CSS
            rule
              .use('css-context')
              .loader(CssContextLoader)
              .before('css-loader');
          }
        }
      }
      chainConfig.plugins.delete('extract-css');
    }
  }
};
