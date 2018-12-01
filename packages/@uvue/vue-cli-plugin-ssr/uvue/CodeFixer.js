const fs = require('fs-extra');
const { join } = require('path');
const rreaddir = require('recursive-readdir');
const findInFiles = require('find-in-files');
const escapeStringRegexp = require('escape-string-regexp');
const prettier = require('prettier');
const { RQuery, Recast } = require('@uvue/rquery');
const consola = require('consola');
const { merge } = require('lodash');
const chalk = require('chalk');

const fileSearchFilter = filename => {
  const regexp = new RegExp(`${filename}.(js|ts)$`);
  return (file, stats) => {
    if (!regexp.test(file) && !stats.isDirectory()) return true;
    return false;
  };
};

module.exports = class CodeFixer {
  constructor(basePath = process.cwd()) {
    this.basePath = basePath;
  }

  async run(api, mainPath) {
    const fixPlugin = async (name, search, methodName, findByImport = false) => {
      consola.start(`Searching ${name} file...`);

      const files = await this.findFiles(search);
      if (!files.length) {
        consola.error(`No ${name} file detected!`);
      } else {
        for (const file of files) {
          const code = await fs.readFile(file, 'utf-8');
          const result = this[methodName](code, findByImport);

          if (code !== result) {
            consola.success(`${name} file fixed!`);
            await fs.writeFile(file, result);
          } else {
            consola.info(`${name} file doesn't need to be fixed`);
          }
        }
      }
    };

    const hasDependency = name => {
      const packageJson = require(api.resolve('package.json'));
      return packageJson.dependencies[name] ? true : false;
    };

    // Router
    await fixPlugin('Router', [/import\s.*from\s.*vue-router/gm], 'fixRouter', true);

    // Vuex
    if (api.hasPlugin('vuex')) {
      await fixPlugin('Vuex', [/import\s.*from\s.*vuex/gm], 'fixVuex', true);
    }

    // i18n
    if (api.hasPlugin('i18n')) {
      await fixPlugin('I18n', [/import\s.*from\s.*vue-i18n/gm], 'fixI18n', true);
    }

    // PWA
    if (api.hasPlugin('pwa')) {
      await fixPlugin('PWA', ['code:register-service-worker'], 'fixPwa');
    }

    // Apollo
    if (api.hasPlugin('apollo')) {
      await fixPlugin('Apollo', ['code:createApolloClient'], 'fixApollo');

      // Check isomorphic fetch is installed
      if (!hasDependency('isomorphic-fetch')) {
        consola.warn(
          '`isomorphic-fetch` package is required to use Vue Apollo in SSR mode\nhttps://universal-vue.github.io/docs/guide/vue-cli-plugins.html#apollo\n',
        );
      }

      // Check UVue plugin presence
      let pluginPath = './src/plugins/apollo';
      const files = await this.findFiles(['code:__APOLLO_STATE__']);

      if (!files.length) {
        // Copy file from vue cli plugin
        await fs.copy(join(__dirname, '..', 'generator', 'templates', 'apollo'), api.resolve(''));
        consola.success(`UVue Apollo plugin installed in src/plugins/apollo.js`);
      } else {
        pluginPath = files[0];
      }

      // Check UVue config
      const requireEsm = require('esm')(module);
      const uvueConfig = requireEsm(api.resolve('uvue.config.js')).default;
      if (
        uvueConfig.plugins.findIndex(item => {
          return item == pluginPath || item[0] == pluginPath;
        }) < 0
      ) {
        consola.warn(
          'Need to install UVue Apollo plugin in your uvue.config.js file\nhttps://universal-vue.github.io/docs/guide/vue-cli-plugins.html#apollo\n',
        );
      }
    }

    // Main
    {
      consola.start(`Try to fix main file...`);

      if (fs.existsSync(mainPath + '.ts')) {
        mainPath += '.ts';
      } else {
        mainPath += '.js';
      }

      const code = await fs.readFile(mainPath, 'utf-8');
      let result = this.fixNewVue(code);
      result = this.fixPluginVueOption(result, 'router');

      if (api.hasPlugin('vuex')) {
        result = this.fixPluginVueOption(result, 'store');
      }

      if (api.hasPlugin('i18n')) {
        result = this.fixPluginVueOption(result, 'i18n');
      }

      if (code !== result) {
        consola.success(`Main file fixed!`);
        await fs.writeFile(mainPath, result);
      } else {
        consola.info(`Main file doesn't need to be fixed`);
      }
    }
  }

  async findFiles(checks = []) {
    let filesResults = [];
    let codesResults = [];

    const codes = [];

    for (const check of checks) {
      let type, value;
      if (check instanceof RegExp) {
        type = 'code';
        value = check;
      } else {
        const chunks = check.split(':');
        type = chunks[0];
        value = chunks[1];
      }

      if (type === 'file') {
        const files = await rreaddir(this.basePath, [fileSearchFilter(value)]);
        filesResults = filesResults.concat(files);
      } else if (type === 'code') {
        codes.push(value);
        if (value instanceof RegExp) {
          const files = await findInFiles.find(
            {
              term: value.source,
              flags: value.flags,
            },
            this.basePath,
            '.(js|ts)$',
          );
          codesResults = codesResults.concat(Object.keys(files));
        } else {
          const files = await findInFiles.find(value, this.basePath, '.(js|ts)$');
          codesResults = codesResults.concat(Object.keys(files));
        }
      }
    }

    const filesOK = [];

    if (filesResults.length && codes.length) {
      for (const file of filesResults) {
        if (codesResults.indexOf(file) >= 0) continue;

        const fileContent = await fs.readFile(file, 'utf-8');

        let found = false;
        for (const code of codes) {
          const regexp = code instanceof RegExp ? code : new RegExp(escapeStringRegexp(code), 'gm');
          if (regexp.test(fileContent)) {
            found = true;
            break;
          }
        }

        if (found) filesOK.push(file);
      }
    }

    return Array.from(new Set([].concat(codesResults, filesOK)));
  }

  resolveCodingStyle(code) {
    if (this.prettierOptions) return this.prettierOptions;

    const prettierConfigFile = prettier.resolveConfigFile.sync(this.basePath);

    if (prettierConfigFile) {
      this.prettierOptions = prettier.resolveConfig.sync(this.basePath);
    } else {
      this.prettierOptions =
        prettier.resolveConfig.sync(this.basePath) ||
        merge(
          {
            singleQuote: true,
            bracketSpacing: true,
          },
          this.detecteCodingStyle(code),
        );
    }

    return this.prettierOptions;
  }

  detecteCodingStyle(code) {
    const simpleQuoteCount = code.split("'").length;
    const doubleQuoteCount = code.split('"').length;
    const semiCount = code.split(';').length;
    const tabCount = code.split(`\t`).length;

    return {
      singleQuote: doubleQuoteCount < simpleQuoteCount,
      semi: semiCount >= 3,
      useTabs: tabCount >= 3,
    };
  }

  fixRouter(code, findByImport = false) {
    if (!findByImport) {
      code = this.fixPlugin(code, 'Router');
      return this.fixPlugin(code, 'VueRouter');
    } else {
      return this.fixPlugin(code, 'vue-router', true);
    }
  }

  fixVuex(code, findByImport = false) {
    if (!findByImport) {
      code = this.fixPlugin(code, 'Vuex.Store');
    } else {
      code = this.fixPlugin(code, 'vuex', findByImport, {
        Vuex: 'Vuex.Store',
      });
    }

    // Transform state to a factory function
    const doc = RQuery.parse(code);
    let changes = false;
    doc.find('{}').forEach(obj => {
      const stateProp = obj.getProp('state');
      if (stateProp && stateProp.node.type === 'ObjectExpression') {
        changes = true;
        const arrowFunc = RQuery.parse('() => (replace)').findOne('funcArrow');
        arrowFunc.findOne('id#replace').replace(stateProp);
        stateProp.replace(arrowFunc);
      }
    });

    if (changes) {
      const prettierOptions = this.resolveCodingStyle(code);
      return RQuery.print(doc, {
        prettierConfig: prettierOptions,
      });
    }
    return code;
  }

  fixI18n(code, findByImport = false) {
    if (!findByImport) {
      return this.fixPlugin(code, 'VueI18n');
    }
    return this.fixPlugin(code, 'vue-i18n', findByImport);
  }

  fixPwa(code) {
    const doc = RQuery.parse(code);

    const importStatement = doc.findOne('import#register');
    const registerCall = doc.findOne('id#register');

    if (importStatement && registerCall) {
      const ifStatement = registerCall.parentType('IfStatement');

      const haveCheck = ifStatement.findOne('process.client');
      if (!haveCheck) {
        const newIfNode = RQuery.parse('if(replaceOld && replaceCheck) {}').node.program.body[0]
          .test;

        const newIf = RQuery.fromNode(newIfNode);
        newIf.findOne('id#replaceOld').replace(RQuery.fromNode(ifStatement.node.test));
        newIf
          .findOne('id#replaceCheck')
          .replace(RQuery.parse('process.client').findOne('process.client'));

        ifStatement.node.test = newIf.node;

        const prettierOptions = this.resolveCodingStyle(code);

        return RQuery.print(doc, {
          prettierConfig: prettierOptions,
        });
      }
    }

    return code;
  }

  fixPlugin(code, name, findByImport = false, altNames = {}) {
    const doc = RQuery.parse(code);

    if (findByImport) {
      const importDec = doc.findOne(`import@${name}`);

      if (!importDec) {
        return code;
      }

      for (const spec of importDec.node.specifiers) {
        if (spec.type === 'ImportDefaultSpecifier') {
          name = spec.local.name;
        }
      }

      if (altNames[name]) {
        name = altNames[name];
      }
    }

    const newPlugin = doc.findOne(`new#${name}`);

    if (newPlugin) {
      const parent = newPlugin.parent();

      if (parent.node.type === 'VariableDeclarator') {
        const topExport = parent.parentType('ExportDefaultDeclaration');
        if (topExport) {
          return code;
        }

        // Complex case
        doc.findOne('exportDefault').remove();

        // Get variable ID
        const variableName = parent.node.id.name;

        // Determine start & last indexes
        const elements = doc.find(`id#${variableName}`);

        const firstNode = parent.parents[1];
        const lastNode = elements.get(elements.size() - 1).parents[1];

        let firstIndex, lastIndex;
        for (const index in doc.node.program.body) {
          const currentNode = doc.node.program.body[index];

          if (currentNode === firstNode) {
            firstIndex = index;
          }

          if (currentNode === lastNode) {
            lastIndex = index;
          }
        }

        if (firstIndex !== undefined && lastIndex !== undefined) {
          const newExport = RQuery.parse(
            `export default () => { CODEFIXER_REPLACE_BODY\n return ${variableName}; }`,
          ).findOne('exportDefault');

          const nodes = doc.node.program.body.splice(
            firstIndex,
            lastIndex - firstIndex + 1,
            newExport.node,
          );

          let bodyCode = '';
          for (const node of nodes) {
            bodyCode += Recast.print(node) + `\n\n`;
          }

          const prettierOptions = this.resolveCodingStyle(code);
          const newCode = RQuery.print(doc);

          return RQuery.prettify(newCode.replace('CODEFIXER_REPLACE_BODY', bodyCode), {
            prettierConfig: prettierOptions,
          });
        }
      } else if (parent.node.type === 'ExportDefaultDeclaration') {
        const parentFunc =
          newPlugin.parentType('FunctionDeclaration') ||
          newPlugin.parentType('ArrowFunctionExpression');

        // Simple case
        if (!parentFunc) {
          const returnFunc = RQuery.parse('() => { return replace; }').findOne('funcArrow');

          returnFunc.findOne('id#replace').replace(newPlugin);

          newPlugin.replace(returnFunc);
        }
      }

      const prettierOptions = this.resolveCodingStyle(code);
      return RQuery.print(doc, {
        prettierConfig: prettierOptions,
      });
    }
    return code;
  }

  fixNewVue(code) {
    const doc = RQuery.parse(code);
    const newVue = doc.findOne(`new#Vue`);

    if (newVue) {
      let parent = newVue.parentType('VariableDeclarator');

      if (parent) {
        // Complex case
        const topExport = parent.parentType('ExportDefaultDeclaration');
        if (topExport) {
          return code;
        }

        const callParent = newVue.parentType('CallExpression');
        if (callParent) {
          callParent.replace(newVue);
        }

        // Get variable ID
        const variableName = parent.node.id.name;

        // Determine start & last indexes
        const elements = doc.find(`id#${variableName}`);

        const firstNode = parent.parents[1];
        const lastNode = elements.get(elements.size() - 1).parents[1];

        let firstIndex, lastIndex;
        for (const index in doc.node.program.body) {
          const currentNode = doc.node.program.body[index];

          if (currentNode === firstNode) {
            firstIndex = index;
          }

          if (currentNode === lastNode) {
            lastIndex = index;
          }
        }

        if (firstIndex !== undefined && lastIndex !== undefined) {
          const newExport = RQuery.parse(
            `export default () => { CODEFIXER_REPLACE_BODY\n return ${variableName}; }`,
          ).findOne('exportDefault');

          const nodes = doc.node.program.body.splice(
            firstIndex,
            lastIndex - firstIndex + 1,
            newExport.node,
          );

          let bodyCode = '';
          for (const node of nodes) {
            bodyCode += Recast.print(node) + `\n\n`;
          }

          const prettierOptions = this.resolveCodingStyle(code);
          const newCode = RQuery.print(doc);

          return RQuery.prettify(newCode.replace('CODEFIXER_REPLACE_BODY', bodyCode), {
            prettierConfig: prettierOptions,
          });
        }
      } else {
        // Simple case

        const parentFunc =
          newVue.parentType('FunctionDeclaration') || newVue.parentType('ArrowFunctionExpression');

        const exportDefault = newVue.parentType('ExportDefaultDeclaration');

        let returnFunc = exportDefault
          ? RQuery.parse('() => { return replace; }').findOne('funcArrow')
          : RQuery.parse('export default () => { return replace; }').findOne('exportDefault');

        if (!parentFunc) {
          returnFunc.findOne('id#replace').replace(newVue);
          newVue.replace(returnFunc);
        } else {
          returnFunc = parentFunc;

          if (!exportDefault) {
            const insertExport = RQuery.parse('export default replace;').findOne('exportDefault');
            insertExport.findOne('id#replace').replace(returnFunc);
            returnFunc.replace(insertExport);
          }
        }

        const callParent = newVue.parentType('CallExpression');
        if (callParent) {
          callParent.replace(newVue);
        }

        const prettierOptions = this.resolveCodingStyle(code);

        return RQuery.print(doc, {
          prettierConfig: prettierOptions,
        });
      }
    }
    return code;
  }

  fixPluginVueOption(code, name) {
    const doc = RQuery.parse(code);

    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    const exportDefault = doc.findOne('exportDefault funcArrow');
    const vueOptions = exportDefault.findOne('new#Vue {}');

    const option = vueOptions.getProp(name).parent();

    if (option) {
      // First check: prop value is function
      if (option.node.value.type === 'CallExpression') {
        return code;
      }

      // Second check: value is defined in export function
      const pluginVar = exportDefault.findOne(`var*#${name}`);
      if (pluginVar) {
        if (pluginVar.node.declarations[0].init.type === 'CallExpression') {
          return code;
        }
      }

      // If not a function declaration, create it
      // First change import name
      const importStatement = doc.findOne(`import#${name}`);
      const importSpecifier = importStatement.node.specifiers.find(
        item => item.type === 'ImportDefaultSpecifier',
      );

      importSpecifier.local.name = `create${capitalizedName}`;

      // Then declare var in export default function
      const varDeclaration = RQuery.parse(`const ${name} = create${capitalizedName}();`).node
        .program.body[0];

      exportDefault.node.body.body.unshift(varDeclaration);

      const prettierOptions = this.resolveCodingStyle(code);

      return RQuery.print(doc, {
        prettierConfig: prettierOptions,
      });
    }

    return code;
  }

  fixApollo(code) {
    return code.replace(/ssr:\s?false/, 'ssr: !!process.server');
  }

  async findVuexStateFiles() {
    const results = {};
    const files = await this.findFiles([/state/gm]);

    for (const filePath of files) {
      const doc = RQuery.parse(await fs.readFile(filePath, 'utf-8'));
      const elements = doc.find('id#state');

      elements.forEach(el => {
        const parent = el.parent();
        if (
          parent.node.type === 'ObjectProperty' &&
          parent.node.value.type === 'ObjectExpression'
        ) {
          // Normal case
          if (!results[filePath]) {
            results[filePath] = { type: 'normal' };
          }
        } else if (
          parent.node.type === 'VariableDeclarator' &&
          parent.node.init.type === 'ObjectExpression'
        ) {
          // Split case
          if (!results[filePath]) {
            results[filePath] = { type: 'split' };
          }
        } else if (
          parent.node.type === 'ObjectProperty' &&
          parent.node.value.type === 'Identifier'
        ) {
          // From a pre-defined variable
          if (!results[filePath]) {
            results[filePath] = { type: 'complex' };
          }
        }
      });
    }

    return results;
  }

  fixVuexState(code) {
    const doc = RQuery.parse(code);
    const elements = doc.find('id#state');

    elements.forEach(el => {
      const parent = el.parent();

      if (parent.node.type === 'ObjectProperty' && parent.node.value.type === 'ObjectExpression') {
        // Normal case
        const obj = parent.nodeProp('value');
        const func = RQuery.parse('() => (replace)').findOne('funcArrow');
        func.findOne('id#replace').replace(obj);

        parent
          .parent()
          .getProp('state')
          .replace(func);
      } else if (
        parent.node.type === 'VariableDeclarator' &&
        parent.node.init.type === 'ObjectExpression'
      ) {
        // Split case
        const obj = parent.nodeProp('init');
        const func = RQuery.parse('() => (replace)').findOne('funcArrow');
        func.findOne('id#replace').replace(obj);

        const declarationIndex = parent
          .parent()
          .node.declarations.findIndex(item => item === parent.node);
        if (declarationIndex >= 0) {
          parent.parent().node.declarations[0].init = func.node;
        }
      }
    });

    if (elements.size()) {
      const prettierOptions = this.resolveCodingStyle(code);
      return RQuery.print(doc, {
        prettierConfig: prettierOptions,
      });
    }
    return code;
  }

  static warningMessage() {
    consola.warn(chalk.red('PLEASE READ THIS MESSAGE'));
    // eslint-disable-next-line
    console.log(`
${chalk.yellow(`At installation, this plugin will try to fix your current project code to make it compatible
with Vue SSR. If you install others Vue CLI plugin after UVue, you have to run "ssr:fix" command`)}

${chalk.yellow('Basically, you need to keep in mind two things:')}

${chalk.yellow('1) Avoid stateful singletons:')}
${chalk.blue(`https://ssr.vuejs.org/guide/structure.html#avoid-stateful-singletons`)}
Command "ssr:fix" try to fix common plugins

List of supported plugins here:
${chalk.blue(`https://universal-vue.github.io/docs/guide/vue-cli-plugins.html`)}

${chalk.yellow('2) Use a factory function to delcare your Vuex states:')}
${chalk.blue(`export default {
  state: () => ({
    // Your variables here
  }),
  // mutations, actions, getters...
}`)}
Command "ssr:fix-vuex" try to fix them automatically
`);
  }
};
