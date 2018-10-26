import {
  goto,
  checkText,
  pageRunTests,
  isSPA,
  testContext,
  wait,
  getText,
} from '../../../utils/e2e';

describe('SPA paths', () => {
  it('Home is correctly mounted', async () => {
    await goto('/spa');
    await isSPA();
    await checkText('h1', 'UVue - Test project');
  });

  it('data() is correctly mounted (client navigation)', async () => {
    await goto('/spa/data');
    await isSPA();
    await pageRunTests();
  });

  it('Plugins install is working (client)', async () => {
    await goto('/spa/plugins-install');
    await isSPA();
    await pageRunTests();
  });

  it('Plugins hooks are invoked (client)', async () => {
    await goto('/spa/plugins-hooks');
    await isSPA();
    await pageRunTests();
  });

  it('Plugins can hook route error (client)', async () => {
    await goto('/spa/plugins-route-error');
    await isSPA();
    await pageRunTests();
  });

  it('Plugins hooks have good context (client)', async () => {
    await goto('/spa/plugins-hooks');
    await isSPA();
    await testContext('/spa/plugins-hooks');
  });

  it('Plugins routeError have good context (client)', async () => {
    await goto('/spa/plugins-route-error');
    await isSPA();
    await testContext('/spa/plugins-route-error');
  });

  it('Redirect works (client)', async () => {
    await goto('/redirect-route');

    expect(await getText('h1')).toContain('UVue');

    await wait(200);
  });

  it('Redirect helper works (client)', async () => {
    await goto('/spa/redirect');
    await isSPA();

    const button = await page.$('button');
    await button.click();
    await wait(200);

    expect(await getText('h1')).toContain('UVue');
  });

  it('Vuex plugin is working (client)', async () => {
    await goto('/spa/plugin-vuex');
    await isSPA();
    await pageRunTests();
  });

  it('asyncData plugin is working (client)', async () => {
    await goto('/spa/plugin-async-data');
    await isSPA();
    await pageRunTests();
  });

  it('Middlewares plugin is working (client)', async () => {
    await goto('/spa/plugin-middlewares');
    await isSPA();
    await pageRunTests();
  });

  it('Error handler methods plugin are working (client)', async () => {
    await goto('/spa/plugin-error-methods');
    await isSPA();

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

  it('Error handler catch errors (client)', async () => {
    await goto('/spa/plugin-error-route');
    await isSPA();
    await pageRunTests();

    const data = JSON.parse(await page.$eval('.error', el => el.textContent));

    expect(data.error).toBeDefined();
    expect(data.statusCode).toBe(403);
  });
});
