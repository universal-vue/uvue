import {
  gotoSSR,
  gotoSPA,
  getText,
  isMounted,
  pageRunTests,
  pageRunTestsSSR,
  testContext,
  testContextSSR,
  wait,
} from '../../../../utils/e2e';

let $;

describe('(Static) Core', () => {
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
    $ = await gotoSSR('/plugins-hooks/bar?bar=baz');
    pageRunTestsSSR($);
  });

  it('Plugins hooks are invoked (server -> client)', async () => {
    await isMounted();
    await pageRunTests('.test:not([ignore-server-client])');
  });

  it('Plugins hooks are invoked (client)', async () => {
    await gotoSPA('plugins-hooks');
    await pageRunTests();
  });

  // ---

  it('Plugins can hook route error (server)', async () => {
    $ = await gotoSSR('/plugins-route-error/bar?bar=baz');
    pageRunTestsSSR($);
  });

  it('Plugins can hook route error (server -> client)', async () => {
    await isMounted();
    await pageRunTests('.test:not([ignore-server-client])');
  });

  it('Plugins can hook route error (client)', async () => {
    await gotoSPA('plugins-route-error');
    await pageRunTests();
  });

  // ---

  it('Plugins hooks have good context (server -> client)', async () => {
    await isMounted();
    await testContext('/plugins-hooks', '.context:not([ignore-server-client])');
  });

  it('Plugins hooks have good context (client)', async () => {
    await gotoSPA('plugins-hooks');
    await testContext('/plugins-hooks');
  });

  it('Plugins routeError have good context (client)', async () => {
    await gotoSPA('plugins-route-error');
    await testContext('/plugins-route-error');
  });

  // ---

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
