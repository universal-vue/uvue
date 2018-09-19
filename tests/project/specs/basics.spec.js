import {
  gotoSSR,
  gotoSPA,
  isMounted,
  checkText,
  pageRunTests,
  pageRunTestsSSR,
} from '../../utils/e2e';

let $;

describe('Basics', () => {
  beforeAll(async () => {
    $ = await gotoSSR('/');
  });

  it('Home is correctly rendered', async () => {
    expect($('h1').text()).toBe('UVue - Test project');
  });

  it('Home is correctly mounted', async () => {
    await isMounted();
    await checkText('h1', 'UVue - Test project');
  });

  it('data() is correctly rendered', async () => {
    $ = await gotoSSR('/data');
    pageRunTestsSSR($);
  });

  it('data() is correctly mounted', async () => {
    await isMounted();
    await pageRunTests();
  });

  it('data() is correctly mounted (client navigation)', async () => {
    await gotoSPA('data');
    await pageRunTests();
  });
});
