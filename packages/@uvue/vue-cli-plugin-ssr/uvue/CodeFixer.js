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
        bracketSpacing: true,
      };

      // Detect coding style from main.js
      const simpleQuoteCount = code.split("'").length;
      const doubleQuoteCount = code.split('"').length;
      const semiCount = code.split(';').length;
      const tabCount = code.split(`\t`).length;

      if (simpleQuoteCount > doubleQuoteCount) {
        this.prettierOptions.singleQuote = true;
      } else {
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

  fixPwa(code) {}

  fixApollo(code) {}

  fixPlugin(code, name) {
    const doc = RQuery.parse(code);
    const newPlugin = doc.find(`new#${name}`).get(0);

    if (newPlugin) {
      const parentFunc =
        newPlugin.parentType('FunctionDeclaration') ||
        newPlugin.parentType('ArrowFunctionExpression');

      if (!parentFunc) {
        const routerFunc = RQuery.parse('() => { return replace; }')
          .find('funcArrow')
          .get(0);

        routerFunc
          .find('id#replace')
          .get(0)
          .replace(newPlugin);

        newPlugin.replace(routerFunc);
      }

      const prettierOptions = this.resolveCodingStyle(code);

      return RQuery.print(doc, {
        prettierConfig: prettierOptions,
      });
    }
    return code;
  }
}
