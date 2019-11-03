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
    this.uvue = api.uvue;
    this.mainPath = this.uvue.getMainPath();
    this.projectPath = this.uvue.getProjectPath();
    this.imports = this.uvue.getConfig('imports');
    this.plugins = this.uvue.getConfig('plugins');
    this.serverPlugins = this.uvue.getServerConfig('plugins');
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

    const callPluginsHooks = async (type, compilation) => {
      for (const plugin of this.serverPlugins) {
        const [src, options] = plugin;
        let m = require(src);
        m = m.default || m;
        if (typeof m[type] === 'function') {
          await m[type](compilation, options);
        }
      }
    };

    // Call plugins hooks when writing files
    compiler.hooks.emit.tapPromise('UVueServerPlugins', async compilation => {
      await callPluginsHooks('webpackEmit', compilation);
    });

    // Call plugins hooks when files are emitted
    compiler.hooks.afterEmit.tapPromise('UVueServerPlugins', async compilation => {
      await callPluginsHooks('webpackAfterEmit', compilation);
    });
  }

  /**
   * Method to write main.js file content
   */
  async writeMain() {
    // Get absolute path for generated main.js
    const dirPath = path.join(this.projectPath, 'node_modules', '.uvue');
    const uvueMainPath = path.join(dirPath, 'main.js');

    let importMainPath = this.mainPath;
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
    if ((await fs.exists(uvueMainPath)) && (await fs.readFile(uvueMainPath, 'utf-8')) == code) {
      // Stop generation of file
      return;
    }

    // Write file
    await fs.ensureDir(dirPath);
    await fs.writeFile(uvueMainPath, code);
  }

  buildImports() {
    let result = '';

    // Handle imports defined in uvue config
    const { normal, noSSR } = this.imports.reduce(
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

    let configPath = path.join(this.projectPath, 'uvue.config');
    if (os.platform() === 'win32') {
      configPath = configPath.replace(/\\/g, '/');
    }

    if (this.plugins) {
      result = `
import { UVue } from '@uvue/core';
import uvueConfig from '${configPath}';

const { plugins } = uvueConfig;
for (const index in plugins) {
  if (typeof plugins[index] === 'string') {
    plugins[index] = [plugins[index], {}];
  }
}
      `;

      for (const index in this.plugins) {
        let plugin = this.plugins[index];

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
