import fs from 'fs-extra';
import rreaddir from 'recursive-readdir';
import findInFiles from 'find-in-files';
import escapeStringRegexp from 'escape-string-regexp';
import prettier from 'prettier';
import { RQuery } from '@uvue/rquery';

const fileSearchFilter = filename => {
  const regexp = new RegExp(`${filename}.(js|ts)$`);
  return (file, stats) => {
    if (!regexp.test(file) && !stats.isDirectory()) return true;
    return false;
  };
};

export default class CodeFixer {
  constructor(basePath = process.cwd()) {
    this.basePath = basePath;
  }

  async findFiles(checks = []) {
    const filesResults = [];
    const codesResults = [];

    const codes = [];

    for (const check of checks) {
      const [type, value] = check.split(':');

      if (type === 'file') {
        const files = await rreaddir(this.basePath, [fileSearchFilter(value)]);
        filesResults.push(...files);
      } else if (type === 'code') {
        codes.push(value);
        const files = await findInFiles.find(value, this.basePath, '.(js|ts)$');
        codesResults.push(...Object.keys(files));
      }
    }

    const filesOK = [];

    if (filesResults.length && codes.length) {
      for (const file of filesResults) {
        if (codesResults.indexOf(file) >= 0) continue;

        const fileContent = await fs.readFile(file, 'utf-8');

        let found = false;
        for (const code of codes) {
          const regexp = new RegExp(escapeStringRegexp(code), 'gm');
          if (regexp.test(fileContent)) {
            found = true;
            break;
          }
        }

        if (found) filesOK.push(file);
      }
    }

    return [...new Set([...codesResults, ...filesOK])];
  }

  resolveCodingStyle(code) {
    if (this.prettierOptions) return this.prettierOptions;

    const prettierConfigFile = prettier.resolveConfigFile.sync(this.basePath);

    if (prettierConfigFile) {
      this.prettierOptions = prettier.resolveConfig.sync(this.basePath);
    } else {
      this.prettierOptions = prettier.resolveConfig.sync(this.basePath) || {
        singleQuote: true,
        bracketSpacing: true,
      };

      // Detect coding style from main.js
      const simpleQuoteCount = code.split("'").length;
      const doubleQuoteCount = code.split('"').length;
      const semiCount = code.split(';').length;
      const tabCount = code.split(`\t`).length;

      if (doubleQuoteCount > simpleQuoteCount) {
        this.prettierOptions.singleQuote = false;
      }

      if (semiCount >= 3) {
        this.prettierOptions.semi = true;
      }

      if (tabCount >= 3) {
        this.prettierOptions.useTabs = true;
      }
    }

    return this.prettierOptions;
  }

  fixRouter(code) {
    return this.fixPlugin(code, 'Router');
  }

  fixVuex(code) {
    return this.fixPlugin(code, 'Vuex.Store');
  }

  fixI18n(code) {
    return this.fixPlugin(code, 'VueI18n');
  }

  fixPlugin(code, name) {
    const doc = RQuery.parse(code);
    const newPlugin = doc.findOne(`new#${name}`);

    if (newPlugin) {
      const parentFunc =
        newPlugin.parentType('FunctionDeclaration') ||
        newPlugin.parentType('ArrowFunctionExpression');

      if (!parentFunc) {
        const returnFunc = RQuery.parse('() => { return replace; }').findOne('funcArrow');

        returnFunc.findOne('id#replace').replace(newPlugin);

        newPlugin.replace(returnFunc);
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
    const newPlugin = doc.findOne(`new#Vue`);

    if (newPlugin) {
      const parentFunc =
        newPlugin.parentType('FunctionDeclaration') ||
        newPlugin.parentType('ArrowFunctionExpression');

      const exportDefault = newPlugin.parentType('ExportDefaultDeclaration');

      let returnFunc = exportDefault
        ? RQuery.parse('() => { return replace; }').findOne('funcArrow')
        : RQuery.parse('export default () => { return replace; }').findOne('exportDefault');

      if (!parentFunc) {
        returnFunc.findOne('id#replace').replace(newPlugin);
        newPlugin.replace(returnFunc);
      } else {
        returnFunc = parentFunc;

        if (!exportDefault) {
          const insertExport = RQuery.parse('export default replace;').findOne('exportDefault');
          insertExport.findOne('id#replace').replace(returnFunc);
          returnFunc.replace(insertExport);
        }
      }

      const callParent = newPlugin.parentType('CallExpression');
      if (callParent) {
        callParent.replace(newPlugin);
      }

      const prettierOptions = this.resolveCodingStyle(code);

      return RQuery.print(doc, {
        prettierConfig: prettierOptions,
      });
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
}
