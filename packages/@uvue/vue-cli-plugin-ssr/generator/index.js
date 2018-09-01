module.exports = api => {
  api.extendPackage({
    dependencies: {
      'vue-router': '^3.0.1',
      '@uvue/core': '^0.4.0-alpha.0',
      '@uvue/server': '^0.4.0-alpha.0',
    },
    scripts: {
      'ssr:serve': 'vue-cli-service ssr:serve',
    },
  });
};
