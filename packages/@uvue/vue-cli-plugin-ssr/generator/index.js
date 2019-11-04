// ESM module for Node
// eslint-disable-next-line
require = require('esm')(module);

const fs = require('fs-extra');
const path = require('path');
const { stringify } = require('javascript-stringify');
const CodeFixer = require('../uvue/CodeFixer');
const chalk = require('chalk');

module.exports = (api, options) => {
  // Install router
  if (!api.hasPlugin('router')) {
    const routerGenerator = require('@vue/cli-service/generator/router');
    routerGenerator(api, {
      routerHistoryMode: true,
    });
  }

  const extendPackage = {
    dependencies: {
      '@uvue/core': '^0.1.0',
      '@uvue/server': '^0.1.0',
      compression: '^1.7.3',
      connect: '^3.6.6',
      'cookie-parser': '^1.4.3',
      'serve-static': '^1.13.2',
      'core-js': '^3.3.2',
    },
    scripts: {
      'ssr:serve': 'vue-cli-service ssr:serve',
      'ssr:build': 'vue-cli-service ssr:build',
      'ssr:start': 'vue-cli-service ssr:start',
      'ssr:static': 'vue-cli-service ssr:static',
      'ssr:fix': 'vue-cli-service ssr:fix',
      'ssr:fix-vuex': 'vue-cli-service ssr:fix-vuex',
    },
  };

  if (api.invoking) {
    // Base templates
    api.render('./templates/base');

    // Docker files
    if (options.docker === 'dockerfile') {
      api.render('./templates/docker');
    } else if (options.docker === 'docker-compose') {
      api.render('./templates/docker');
      api.render('./templates/docker-nginx');
    }

    // UVue config
    const uvueConfig = {
      plugins: [],
    };

    if (options.uvuePlugins) {
      for (const name of options.uvuePlugins) {
        const pluginPath = `@uvue/core/plugins/${name}`;
        let pluginOptions = null;

        if (name === 'vuex' && options.vuexOptions.length) {
          pluginOptions = options.vuexOptions.reduce((opts, optionName) => {
            opts[optionName] = true;
            return opts;
          }, {});
        }

        if (pluginOptions) {
          uvueConfig.plugins.push([pluginPath, pluginOptions]);
        } else {
          uvueConfig.plugins.push(pluginPath);
        }
      }
    }

    fs.writeFileSync(
      api.resolve('uvue.config.js'),
      `export default ${stringify(uvueConfig, null, 2)}`,
    );

    // Server config
    const serverConfig = {
      plugins: [],
    };

    if (options.serverPlugins) {
      for (const name of options.serverPlugins) {
        const pluginPath = `@uvue/server/plugins/${name}`;
        let pluginOptions = null;

        if (name === 'cookie' && options.cookieSecret) {
          pluginOptions = { secret: options.cookieSecret };
        }

        if (pluginOptions) {
          serverConfig.plugins.push([pluginPath, pluginOptions]);
        } else {
          serverConfig.plugins.push(pluginPath);
        }
      }
    }

    fs.writeFileSync(
      api.resolve('server.config.js'),
      `export default ${stringify(serverConfig, null, 2)}`,
    );
  }

  // When this plugin is invoked
  api.onCreateComplete(async () => {
    await execCodeFixer(api);

    const { blue, underline, bold } = chalk;

    api.exitLog(
      `UVue installed, please read this before starting:\n${bold(
        underline(
          blue(
            'https://universal-vue.github.io/docs/guide/post-install.html#post-installation-notes',
          ),
        ),
      )}`,
      'done',
    );
  });

  // When another plugin is invoked
  // Not working ?
  // api.afterAnyInvoke(async () => {
  //   await execCodeFixer(api, {
  //     silent: true,
  //   });
  // });

  api.extendPackage(extendPackage);
};

async function execCodeFixer(api, options = {}) {
  const configPath = api.resolve('uvue.config.js');

  let config = { path: { main: './src/main' } };
  if (fs.existsSync(configPath)) {
    config = require(api.resolve('uvue.config.js'));
    if (!config.paths) {
      config.paths = {};
    }
  }

  const mainPath = config.paths.main || './src/main';

  const cf = new CodeFixer(path.join(api.generator.context, 'src'), options);
  await cf.run(api, mainPath);
}
