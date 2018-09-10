const fs = require('fs-extra');
const path = require('path');

/**
 * Simple webpack plugin to generate main.js with imports
 * defined in configuration file
 */
module.exports = class UVuePlugin {
  /**
   * Constructor
   * Need Vue CLI API
   */
  constructor({ api }) {
    this.api = api;
    this.uvue = api.uvue;
  }

  /**
   * Method to install plugin
   */
  apply(compiler) {
    this.compiler = compiler;

    compiler.hooks.run.tapPromise('UVuePlugin', async () => {
      await this.writeMain();
    });

    compiler.hooks.watchRun.tapPromise('UVuePlugin', async () => {
      // TODO: Watch for uvue.config.js changes
      await this.writeMain();
    });
  }

  /**
   * Method to write main.js file content
   */
  async writeMain() {
    // Get absolute path for generated main.js
    const dirPath = path.join(this.uvue.getProjectPath(), 'node_modules', '.uvue');
    const mainPath = path.join(dirPath, 'main.js');

    // Generate file content
    let code = `import createApp from '@/main';\nexport { createApp };\n`;

    // Handle imports defined in uvue config
    const { normal, noSSR } = this.uvue.getConfig('imports').reduce(
      (result, item) => {
        if (item.ssr === false) {
          result.noSSR.push(item.src);
        } else {
          result.normal.push(item.src);
        }
        return result;
      },
      { normal: [], noSSR: [] },
    );

    code += `${normal.map(item => `require("${item}");`).join(`\n`)}\n`;
    code += `if (process.client) {\n${noSSR.map(item => `require("${item}");`).join(`\n`)}\n}`;

    // If file exists and content not updtaed
    if ((await fs.exists(mainPath)) && (await fs.readFile(mainPath, 'utf-8')) == code) {
      // Stop generation of file
      return;
    }

    // Write file
    await fs.ensureDir(dirPath);
    await fs.writeFile(mainPath, code);
  }
};
