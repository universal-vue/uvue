const { baseURL, gotoSSR, checkText, pageTest, pageTestSSR } = require('../../utils/e2e');

let $;

describe('Project test sample', () => {
  beforeAll(async () => {
    $ = await gotoSSR(baseURL);
  });

  it('Basics: Home is correctly rendered', async () => {
    expect($('h1').text()).toBe('UVue - Test project');
  });

  it('Basics: Home is correctly mounted', async () => {
    await checkText('h1', 'UVue - Test project');
  });

  it('Basics: data() is correctly rendered', async () => {
    $ = await gotoSSR(baseURL + '/data');
    pageTestSSR($);
  });

  it('Basics: data() is correctly mounted', async () => {
    await pageTest();
  });
});
