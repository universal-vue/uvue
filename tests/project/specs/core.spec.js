const {
  gotoSSR,
  gotoSPA,
  getText,
  isMounted,
  pageRunTests,
  pageRunTestsSSR,
  testContext,
  testContextSSR,
  wait,
} = require('../../utils/e2e');

let $;

describe('Core', () => {
  beforeAll(async () => {
    $ = await gotoSSR('/');
  });

  // ---

  it('Plugins install is working (server)', async () => {
    $ = await gotoSSR('/plugins-install');
    pageRunTestsSSR($);
  });

  it('Plugins install is working (server -> client)', async () => {
    await isMounted();
    await pageRunTests();
  });

  it('Plugins install is working (client)', async () => {
    await gotoSPA('plugins-install');
    await pageRunTests();
  });

  // ---

  it('Plugins hooks are invoked (server)', async () => {
    $ = await gotoSSR('/plugins-hooks');
    pageRunTestsSSR($);
  });

  it('Plugins hooks are invoked (server -> client)', async () => {
    await isMounted();
    await pageRunTests();
  });

  it('Plugins hooks are invoked (client)', async () => {
    await gotoSPA('plugins-hooks');
    await pageRunTests();
  });

  // ---

  it('Plugins can hook route error (server)', async () => {
    $ = await gotoSSR('/plugins-route-error');
    pageRunTestsSSR($);
  });

  it('Plugins can hook route error (server -> client)', async () => {
    await isMounted();
    await pageRunTests();
  });

  it('Plugins can hook route error (client)', async () => {
    await gotoSPA('plugins-route-error');
    await pageRunTests();
  });

  // ---

  it('Plugins hooks have good context (server)', async () => {
    $ = await gotoSSR('/plugins-hooks/bar?bar=baz');
    testContextSSR($, '/plugins-hooks');
  });

  it('Plugins hooks have good context (server -> client)', async () => {
    await isMounted();
    await testContext('/plugins-hooks');
  });

  it('Plugins hooks have good context (client)', async () => {
    await gotoSPA('plugins-hooks');
    await testContext('/plugins-hooks');
  });

  it('Plugins routeError have good context (server)', async () => {
    $ = await gotoSSR('/plugins-route-error/bar?bar=baz');
    testContextSSR($, '/plugins-route-error');
  });

  it('Plugins routeError have good context (server -> client)', async () => {
    await isMounted();
    await testContext('/plugins-route-error');
  });

  it('Plugins routeError have good context (client)', async () => {
    await gotoSPA('plugins-route-error');
    await testContext('/plugins-route-error');
  });

  // ---

  it('Redirect works (server)', async () => {
    $ = await gotoSSR('/redirect-route');

    expect($('h1').text()).toContain('UVue');
  });

  it('Redirect works (client)', async () => {
    await gotoSPA('redirect-route');

    expect(await getText('h1')).toContain('UVue');

    await wait(200);
  });

  it('Redirect helper works (client)', async () => {
    await gotoSPA('redirect');

    const button = await page.$('button');
    await button.click();
    await wait(200);

    expect(await getText('h1')).toContain('UVue');
  });
});
