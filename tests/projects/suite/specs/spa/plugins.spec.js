import { goto, isMounted, pageRunTests } from '../../../../utils/e2e';

describe('(SPA) Core plugins', () => {
  it('Vuex plugin is working (client)', async () => {
    await goto('/plugin-vuex');
    await pageRunTests();
  });

  it('asyncData plugin is working (client)', async () => {
    await goto('/plugin-async-data');
    await pageRunTests();
  });

  it('Middlewares plugin is working (client)', async () => {
    await goto('/plugin-middlewares');
    await pageRunTests();
  });

  it('Error handler methods plugin are working (client)', async () => {
    await goto('/plugin-error-methods');

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
    await goto('/plugin-error-route');
    await pageRunTests();

    const data = JSON.parse(await page.$eval('.error', el => el.textContent));

    expect(data.error).toBeDefined();
    expect(data.statusCode).toBe(403);
  });
});
