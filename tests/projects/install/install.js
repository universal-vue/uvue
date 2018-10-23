module.exports = () => {
  return {
    dependencies: {
      vuex: true,
    },
    plugins: {
      '@vue/pwa': [],
      i18n: [
        '--locale',
        'en',
        '--fallbackLocale',
        '--en',
        '--localeDir',
        'locales',
        '--enableInSFC',
        0,
      ],
      apollo: ['--addExamples', '--addServer'],
      '@vue/typescript': [
        '--classComponent',
        1,
        '--useTsWithBabel',
        1,
        '--lint',
        0,
        '--lintOn',
        'save',
      ],
    },
  };
};
