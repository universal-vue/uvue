const { gotoSSR, gotoSPA, isMounted, pageRunTests, pageRunTestsSSR } = require('../../utils/e2e');

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
});
