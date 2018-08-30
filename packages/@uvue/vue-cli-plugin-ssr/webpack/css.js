module.exports = (api, chainConfig) => {
  // CSS rules names
  const cssRulesNames = ['css', 'postcss', 'scss', 'sass', 'less', 'stylus'];
  const oneOfsNames = [];

  // No extract: All CSS will be inlined
  if (!api.uvue.getConfig('css.extract')) {
    oneOfsNames.push('normal', 'normal-modules', 'vue', 'vue-modules');
  } else {
    oneOfsNames.push('vue', 'vue-modules');
  }

  // Replace extract css loader by vue style loader
  if (oneOfsNames.length) {
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
  }
};
