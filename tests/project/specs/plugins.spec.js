const { gotoSSR, gotoSPA, isMounted, pageRunTests, pageRunTestsSSR } = require('../../utils/e2e');

let $;

describe('Core plugins', () => {
  beforeAll(async () => {
    $ = await gotoSSR('/');
  });

  // ---

  it('Vuex plugin is working (server)', async () => {
    $ = await gotoSSR('/plugin-vuex');
    pageRunTestsSSR($);
  });

  it('Vuex plugin is working (server -> client)', async () => {
    await isMounted();
    await pageRunTests();
  });

  it('Vuex plugin is working (client)', async () => {
    await gotoSPA('plugin-vuex');
    await pageRunTests();
  });

  // ---

  it('asyncData plugin is working (server)', async () => {
    $ = await gotoSSR('/plugin-async-data');
    pageRunTestsSSR($);
  });

  it('asyncData plugin is working (server -> client)', async () => {
    await isMounted();
    await pageRunTests();
  });

  it('asyncData plugin is working (client)', async () => {
    await gotoSPA('plugin-async-data');
    await pageRunTests();
  });
});
