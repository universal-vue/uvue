import { gotoSSR, gotoSPA, isMounted, pageRunTests, pageRunTestsSSR } from '../../../utils/e2e';

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

  // ---

  it('Middlewares plugin is working (server)', async () => {
    $ = await gotoSSR('/plugin-middlewares');
    pageRunTestsSSR($);
  });

  it('Middlewares plugin is working (server -> client)', async () => {
    await isMounted();
    await pageRunTests();
  });

  it('Middlewares plugin is working (client)', async () => {
    await gotoSPA('plugin-middlewares');
    await pageRunTests();
  });

  // ---

  it('Error handler methods plugin are working (client)', async () => {
    await gotoSSR('/plugin-error-methods');

    const triggerError = await page.$('.set-error');
    await triggerError.click();

    let data = JSON.parse(await page.$eval('.error', el => el.textContent));

    expect(data.error).toBeDefined();
    expect(data.statusCode).toBe(500);

    const clearError = await page.$('.clear-error');
    await clearError.click();

    data = JSON.parse(await page.$eval('.error', el => el.textContent));

    expect(data.error).toBeNull();
    expect(data.statusCode).toBeNull();
  });

  it('Error handler catch errors (server)', async () => {
    $ = await gotoSSR('/plugin-error-route');
    pageRunTestsSSR($);

    expect($.DATA.errorHandler.error).toBeDefined();
    expect($.DATA.errorHandler.statusCode).toBe(403);

    const data = JSON.parse($('.error').text());

    expect(data.error).toBeDefined();
    expect(data.statusCode).toBe(403);
  });

  it('Error handler catch errors (server -> client)', async () => {
    await isMounted();
    await pageRunTests();

    const data = JSON.parse(await page.$eval('.error', el => el.textContent));

    expect(data.error).toBeDefined();
    expect(data.statusCode).toBe(403);
  });

  it('Error handler catch errors (client)', async () => {
    await gotoSPA('plugin-error-route');
    await pageRunTests();

    const data = JSON.parse(await page.$eval('.error', el => el.textContent));

    expect(data.error).toBeDefined();
    expect(data.statusCode).toBe(403);
  });
});
