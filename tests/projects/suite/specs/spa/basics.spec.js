import { goto, checkText, pageRunTests } from '../../../../utils/e2e';

let $;

describe('(SPA) Basics', () => {
  beforeAll(async () => {
    await goto('/');
  });

  it('Home is correctly mounted', async () => {
    await checkText('h1', 'UVue - Test project');
  });

  it('data() is correctly mounted', async () => {
    await goto('/data');
    await pageRunTests();
  });
});
