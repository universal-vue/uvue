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

  it('Should find files with RegExp', async () => {
    const files = await cf.findFiles([/import\s.*from\s.*(vuex)/gm]);
    expect(files.length).toBe(4);
  });

  it('Should dectect coding style', async () => {
    const testA = await fs.readFile(
      path.resolve(__dirname, '../mocks/code-fixer/detectStyle/testA.js'),
      'utf-8',
    );

    const testB = await fs.readFile(
      path.resolve(__dirname, '../mocks/code-fixer/detectStyle/testB.js'),
      'utf-8',
    );

    expect(cf.detecteCodingStyle(testA)).toEqual({
      singleQuote: true,
      semi: true,
      useTabs: false,
    });

    expect(cf.detecteCodingStyle(testB)).toEqual({
      singleQuote: false,
      semi: false,
      useTabs: true,
    });
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

  it('Should fix complex router.js', async () => {
    const filePath = path.resolve(__dirname, '../mocks/code-fixer/transform/routerComplex.js');
    const fixedPath = path.resolve(
      __dirname,
      '../mocks/code-fixer/transform/routerComplexFixed.js',
    );

    const code = await fs.readFile(filePath, 'utf-8');
    const codeFixed = await fs.readFile(fixedPath, 'utf-8');

    const codeResult = cf.fixRouter(code);
    expect(codeResult).toBe(codeFixed);
  });

  it('Should not fix already fixed complex router.js', async () => {
    const filePath = path.resolve(__dirname, '../mocks/code-fixer/transform/routerComplexFixed.js');
    const fixedPath = path.resolve(
      __dirname,
      '../mocks/code-fixer/transform/routerComplexFixed.js',
    );

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

  it('Should fix complex main.js', async () => {
    const filePath = path.resolve(__dirname, '../mocks/code-fixer/transform/mainComplex.js');
    const fixedPath = path.resolve(__dirname, '../mocks/code-fixer/transform/mainComplexFixed.js');

    const code = await fs.readFile(filePath, 'utf-8');
    const codeFixed = await fs.readFile(fixedPath, 'utf-8');

    const codeResult = cf.fixNewVue(code);

    expect(codeResult).toBe(codeFixed);
  });

  it('Should not fix already fixed complex main.js', async () => {
    const filePath = path.resolve(__dirname, '../mocks/code-fixer/transform/mainComplexFixed.js');
    const fixedPath = path.resolve(__dirname, '../mocks/code-fixer/transform/mainComplexFixed.js');

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

  it('Should fix registerServiceWorker.js', async () => {
    const filePath = path.resolve(__dirname, '../mocks/code-fixer/transform/pwa.js');
    const fixedPath = path.resolve(__dirname, '../mocks/code-fixer/transform/pwaFixed.js');

    const code = await fs.readFile(filePath, 'utf-8');
    const codeFixed = await fs.readFile(fixedPath, 'utf-8');

    let codeResult = cf.fixPwa(code);
    expect(codeResult).toBe(codeFixed);
  });

  it('Should not fix already fixed registerServiceWorker.js', async () => {
    const filePath = path.resolve(__dirname, '../mocks/code-fixer/transform/pwaFixed.js');
    const fixedPath = path.resolve(__dirname, '../mocks/code-fixer/transform/pwaFixed.js');

    const code = await fs.readFile(filePath, 'utf-8');
    const codeFixed = await fs.readFile(fixedPath, 'utf-8');

    let codeResult = cf.fixPwa(code);
    expect(codeResult).toBe(codeFixed);
  });

  it('Should find files with a possible Vuex state to fix', async () => {
    const mocksPath = path.resolve(__dirname, '../mocks/code-fixer/storeStates');
    const cf = new CodeFixer(mocksPath);
    const files = await cf.findVuexStateFiles();
    expect(Object.keys(files).length).toBe(3);
  });

  it('Should fix Vuex states', async () => {
    {
      const filePath = path.resolve(__dirname, '../mocks/code-fixer/storeStates/normal.js');
      const fixedPath = path.resolve(__dirname, '../mocks/code-fixer/storeStates/fixed.js');

      const code = await fs.readFile(filePath, 'utf-8');
      const codeFixed = await fs.readFile(fixedPath, 'utf-8');

      let codeResult = cf.fixVuexState(code);
      expect(codeResult).toBe(codeFixed);
    }

    {
      const filePath = path.resolve(__dirname, '../mocks/code-fixer/storeStates/store/split.js');
      const fixedPath = path.resolve(__dirname, '../mocks/code-fixer/storeStates/store/fixed.js');

      const code = await fs.readFile(filePath, 'utf-8');
      const codeFixed = await fs.readFile(fixedPath, 'utf-8');

      let codeResult = cf.fixVuexState(code);
      expect(codeResult).toBe(codeFixed);
    }
  });
});
