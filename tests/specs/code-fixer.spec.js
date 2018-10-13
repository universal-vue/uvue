import path from 'path';
import fs from 'fs-extra';
import CodeFixer from '@uvue/vue-cli-plugin-ssr/uvue/CodeFixer';

const mocksPath = path.resolve(__dirname, '../mocks/code-fixer/find');
const cf = new CodeFixer(mocksPath);

describe('CodeFixer', () => {
  it('Should find files', async () => {
    const files = await cf.findFiles(['file:store', 'code:new Vuex.Store', 'code:new Store']);
    expect(files.length).toBe(4);
  });

  it('Should fix router.js', async () => {
    const filePath = path.resolve(__dirname, '../mocks/code-fixer/transform/router.js');
    const fixedPath = path.resolve(__dirname, '../mocks/code-fixer/transform/routerFixed.js');

    const code = await fs.readFile(filePath, 'utf-8');
    const codeFixed = await fs.readFile(fixedPath, 'utf-8');

    const codeResult = cf.fixRouter(code);
    expect(codeResult).toBe(codeFixed);
  });

  it('Should not fix already fixed router.js', async () => {
    const filePath = path.resolve(__dirname, '../mocks/code-fixer/transform/routerFixed.js');
    const fixedPath = path.resolve(__dirname, '../mocks/code-fixer/transform/routerFixed.js');

    const code = await fs.readFile(filePath, 'utf-8');
    const codeFixed = await fs.readFile(fixedPath, 'utf-8');

    const codeResult = cf.fixRouter(code);
    expect(codeResult).toBe(codeFixed);
  });

  it('Should fix store.js', async () => {
    const filePath = path.resolve(__dirname, '../mocks/code-fixer/transform/store.js');
    const fixedPath = path.resolve(__dirname, '../mocks/code-fixer/transform/storeFixed.js');

    const code = await fs.readFile(filePath, 'utf-8');
    const codeFixed = await fs.readFile(fixedPath, 'utf-8');

    const codeResult = cf.fixVuex(code);
    expect(codeResult).toBe(codeFixed);
  });

  it('Should fix main.js', async () => {
    const filePath = path.resolve(__dirname, '../mocks/code-fixer/transform/main.js');
    const fixedPath = path.resolve(__dirname, '../mocks/code-fixer/transform/mainFixed.js');

    const code = await fs.readFile(filePath, 'utf-8');
    const codeFixed = await fs.readFile(fixedPath, 'utf-8');

    const codeResult = cf.fixNewVue(code);

    expect(codeResult).toBe(codeFixed);
  });

  it('Should not fix already fixed main.js', async () => {
    const filePath = path.resolve(__dirname, '../mocks/code-fixer/transform/mainFixed.js');
    const fixedPath = path.resolve(__dirname, '../mocks/code-fixer/transform/mainFixed.js');

    const code = await fs.readFile(filePath, 'utf-8');
    const codeFixed = await fs.readFile(fixedPath, 'utf-8');

    const codeResult = cf.fixNewVue(code);

    expect(codeResult).toBe(codeFixed);
  });

  it('Should fix main.js (already in function)', async () => {
    const filePath = path.resolve(__dirname, '../mocks/code-fixer/transform/mainFunc.js');
    const fixedPath = path.resolve(__dirname, '../mocks/code-fixer/transform/mainFuncFixed.js');

    const code = await fs.readFile(filePath, 'utf-8');
    const codeFixed = await fs.readFile(fixedPath, 'utf-8');

    const codeResult = cf.fixNewVue(code);

    expect(codeResult).toBe(codeFixed);
  });

  it('Should fix main.js (already in export default)', async () => {
    const filePath = path.resolve(__dirname, '../mocks/code-fixer/transform/mainExport.js');
    const fixedPath = path.resolve(__dirname, '../mocks/code-fixer/transform/mainExportFixed.js');

    const code = await fs.readFile(filePath, 'utf-8');
    const codeFixed = await fs.readFile(fixedPath, 'utf-8');

    const codeResult = cf.fixNewVue(code);

    expect(codeResult).toBe(codeFixed);
  });

  it('Should fix Vue options', async () => {
    const filePath = path.resolve(__dirname, '../mocks/code-fixer/transform/vueOptions.js');
    const fixedPath = path.resolve(__dirname, '../mocks/code-fixer/transform/vueOptionsFixed.js');

    const code = await fs.readFile(filePath, 'utf-8');
    const codeFixed = await fs.readFile(fixedPath, 'utf-8');

    let codeResult = cf.fixPluginVueOption(code, 'store');
    codeResult = cf.fixPluginVueOption(codeResult, 'i18n');
    codeResult = cf.fixPluginVueOption(codeResult, 'router');

    expect(codeResult).toBe(codeFixed);
  });
});
