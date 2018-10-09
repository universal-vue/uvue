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

  it('Should fix store.js', async () => {
    const filePath = path.resolve(__dirname, '../mocks/code-fixer/transform/store.js');
    const fixedPath = path.resolve(__dirname, '../mocks/code-fixer/transform/storeFixed.js');

    const code = await fs.readFile(filePath, 'utf-8');
    const codeFixed = await fs.readFile(fixedPath, 'utf-8');

    const codeResult = cf.fixVuex(code);
    expect(codeResult).toBe(codeFixed);
  });
});
