import { goto, getText, pageRunTests, testContext, wait } from '../../../../utils/e2e';

describe('(SPA) Core', () => {
  it('Plugins install is working (client)', async () => {
    await goto('/plugins-install');
    await pageRunTests();
  });

  it('Plugins hooks are invoked (client)', async () => {
    await goto('/plugins-hooks');
    await pageRunTests();
  });

  it('Plugins can hook route error (client)', async () => {
    await goto('/plugins-route-error');
    await pageRunTests();
  });

  it('Plugins hooks have good context (client)', async () => {
    await goto('/plugins-hooks');
    await testContext('/plugins-hooks');
  });

  it('Plugins routeError have good context (client)', async () => {
    await goto('/plugins-route-error');
    await testContext('/plugins-route-error');
  });

  it('Redirect works (client)', async () => {
    await goto('/redirect-route');

    expect(await getText('h1')).toContain('UVue');

    await wait(200);
  });

  it('Redirect helper works (client)', async () => {
    await goto('/redirect');

    const button = await page.$('button');
    await button.click();
    await wait(200);

    expect(await getText('h1')).toContain('UVue');
  });
});
