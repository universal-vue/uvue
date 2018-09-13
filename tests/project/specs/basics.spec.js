const { gotoSSR, isMounted, checkText, pageRunTests, pageRunTestsSSR } = require('../../utils/e2e');

let $;

describe('Basics', () => {
  beforeAll(async () => {
    $ = await gotoSSR('/');
  });

  it('Basics: Home is correctly rendered', async () => {
    expect($('h1').text()).toBe('UVue - Test project');
  });

  it('Basics: Home is correctly mounted', async () => {
    await isMounted();
    await checkText('h1', 'UVue - Test project');
  });

  it('Basics: data() is correctly rendered', async () => {
    $ = await gotoSSR('/data');
    pageRunTestsSSR($);
  });

  it('Basics: data() is correctly mounted', async () => {
    await isMounted();
    await pageRunTests();
  });
});
