const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const CodeFixer = require('../uvue/CodeFixer');
const inquirer = require('inquirer');
const consola = require('consola');

module.exports = api => {
  api.registerCommand(
    'ssr:fix-vuex',
    {
      description: 'try to fix Vuex states to be SSR compatible',
      usage: 'vue-cli-service ssr:fix-vuex',
    },
    async function() {
      const cf = new CodeFixer(path.join(new ApiUtil(api).getProjectPath(), 'src'));

      consola.info('Trying to find Vuex states files...');
      const files = await cf.findVuexStateFiles();

      for (const file in files) {
        let cleanPath = file.replace(new ApiUtil(api).getProjectPath() + '/', '');
        if (os.platform() === 'win32') {
          cleanPath = file.replace(new ApiUtil(api).getProjectPath().replace(/\//g, '\\') + '\\', '');
        }

        if (file.type === 'complex') {
          consola.info(
            `Maybe "${cleanPath}" have a defined Vuex state, but at the moment this command cannot fix it`,
          );
        } else {
          const result = await inquirer.prompt([
            {
              name: 'do',
              message: `Try to fix "${cleanPath}" Vuex state ?`,
              type: 'confirm',
              default: true,
            },
          ]);

          if (result.do) {
            const originalCode = await fs.readFile(file, 'utf-8');
            const code = await cf.fixVuexState(originalCode);
            await fs.writeFile(file, code);
            if (originalCode != code) {
              consola.info('Fixed');
            } else {
              consola.warn('Cannot fix it');
            }
          } else {
            consola.info('Skipped');
          }
        }
      }
    },
  );
};
