const fs = require('fs-extra');
const path = require('path');
const os = require('os');

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

    // Build mode
    compiler.hooks.run.tapPromise('UVuePlugin', async () => {
      await this.writeMain();
    });

    // Watch/Serve mode
    compiler.hooks.watchRun.tapPromise('UVuePlugin', async () => {
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

    let importMainPath = this.uvue.getMainPath();
    if (os.platform() === 'win32') {
      importMainPath = importMainPath.replace(/\\/g, '/');
    }

    // Generate file content
    let code = ``;
    code += `/* eslint-disable */\n`;
    code += `/* tslint:disable */\n`;
    code += `import createApp from '${importMainPath}';\nexport { createApp };\n`;
    code += this.buildImports();
    code += this.buildPlugins();

    // If file exists and content not updated
    if ((await fs.exists(mainPath)) && (await fs.readFile(mainPath, 'utf-8')) == code) {
      // Stop generation of file
      return;
    }

    // Write file
    await fs.ensureDir(dirPath);
    await fs.writeFile(mainPath, code);
  }

  buildImports() {
    let result = '';

    // Handle imports defined in uvue config
    const { normal, noSSR } = this.uvue.getConfig('imports').reduce(
      (result, item) => {
        if (item.ssr === false) result.noSSR.push(item.src);
        else result.normal.push(item.src);
        return result;
      },
      { normal: [], noSSR: [] },
    );

    result += `${normal.map(item => `require("${item}");`).join(`\n`)}\n`;
    result += `if (process.client) {\n${noSSR.map(item => `require("${item}");`).join(`\n`)}\n}`;

    return result;
  }

  buildPlugins() {
    let result = '';

    if (this.uvue.getConfig('plugins')) {
      result = `
import UVue from '@uvue/core';
import uvueConfig from '@/../uvue.config';

const { plugins } = uvueConfig;
for (const index in plugins) {
  if (typeof plugins[index] === 'string') {
    plugins[index] = [plugins[index], {}];
  }
}
      `;

      const plugins = this.uvue.getConfig('plugins');
      for (const index in plugins) {
        let plugin = plugins[index];

        if (typeof plugin === 'string') {
          plugin = [plugin, {}];
        }

        result += `
const plugin${index} = require('${plugin[0]}');
UVue.use(plugin${index}.default || plugin${index}, plugins[${index}][1]);
        `;
      }
    }

    return result;
  }
};
