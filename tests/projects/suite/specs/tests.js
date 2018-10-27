import {
  checkText,
  gotoSSR,
  gotoSPA,
  getText,
  isMounted,
  pageRunTests,
  pageRunTestsSSR,
  testContext,
  testContextSSR,
  wait,
} from '../../../utils/e2e';

/**
 * Basics tests
 */
export const basics = {
  homeServer() {
    it('Home is correctly rendered', async () => {
      const $ = await gotoSSR('/');
      expect($('h1').text()).toBe('UVue - Test project');
    });
    return this;
  },
  homeMount() {
    it('Home is correctly mounted', async () => {
      await isMounted();
      await checkText('h1', 'UVue - Test project');
    });
    return this;
  },
  dataServer() {
    it('data() is correctly rendered', async () => {
      const $ = await gotoSSR('/data');
      pageRunTestsSSR($);
    });
    return this;
  },
  dataMount() {
    it('data() is correctly mounted', async () => {
      await isMounted();
      await pageRunTests();
    });
    return this;
  },
  dataClient() {
    it('data() is correctly mounted (client navigation)', async () => {
      await gotoSPA('data');
      await pageRunTests();
    });
    return this;
  },
};

/**
 * Metas tests
 */
export const metas = {
  home() {
    it('Vue meta is working on home', async () => {
      const $ = await gotoSSR('/');
      const descTag = $('meta[name=description]');

      expect(descTag.length).toBe(1);
      expect(descTag.attr('content')).toBe('home');
    });
    return this;
  },

  data() {
    it('Vue meta is working on data page', async () => {
      const $ = await gotoSSR('/data');

      const descTag = $('meta[name=description]');

      expect(descTag.length).toBe(1);
      expect(descTag.attr('content')).toBe('bar');
    });
    return this;
  },

  asyncData() {
    it('Vue meta is working with asyncData', async () => {
      const $ = await gotoSSR('/plugin-async-data');
      const descTag = $('meta[name=description]');

      expect(descTag.length).toBe(1);
      expect(descTag.attr('content')).toBe('bar');
    });
    return this;
  },

  vuex() {
    it('Vue meta is working with Vuex', async () => {
      const $ = await gotoSSR('/plugin-vuex');
      const descTag = $('meta[name=description]');

      expect(descTag.length).toBe(1);
      expect(descTag.attr('content')).toBe('fetch');
    });
    return this;
  },
};

/**
 * Check plugins are installed
 */
export const pluginsInstall = {
  server() {
    it('Plugins install is working (server)', async () => {
      const $ = await gotoSSR('/plugins-install');
      pageRunTestsSSR($);
    });
    return this;
  },
  mount() {
    it('Plugins install is working (mount)', async () => {
      await isMounted();
      await pageRunTests();
    });
    return this;
  },
  client() {
    it('Plugins install is working (client)', async () => {
      await gotoSPA('plugins-install');
      await pageRunTests();
    });
    return this;
  },
};

/**
 * Check plugins hooks are invoked
 */
export const pluginsHooks = {
  server() {
    it('Plugins hooks are invoked (server)', async () => {
      const $ = await gotoSSR('/plugins-hooks');
      pageRunTestsSSR($);
    });
    return this;
  },
  mount() {
    it('Plugins hooks are invoked (mount)', async () => {
      await isMounted();
      await pageRunTests('.test:not([ignore-server-client])');
    });
    return this;
  },
  client() {
    it('Plugins hooks are invoked (client)', async () => {
      await gotoSPA('plugins-hooks');
      await pageRunTests();
    });
    return this;
  },
};

/**
 * Check route errors are catched by plugins
 */
export const pluginsError = {
  server() {
    it('Plugins can hook route error (server)', async () => {
      const $ = await gotoSSR('/plugins-route-error');
      pageRunTestsSSR($);
    });
    return this;
  },
  mount() {
    it('Plugins can hook route error (mount)', async () => {
      await isMounted();
      await pageRunTests('.test:not([ignore-server-client])');
    });
    return this;
  },
  client() {
    it('Plugins can hook route error (client)', async () => {
      await gotoSPA('plugins-route-error');
      await pageRunTests();
    });
    return this;
  },
};

/**
 * Check plugins have right context
 */
export const pluginsContext = {
  server() {
    it('Plugins hooks have good context (server)', async () => {
      const $ = await gotoSSR('/plugins-hooks/bar?bar=baz');
      testContextSSR($, '/plugins-hooks');
    });
    return this;
  },
  mount() {
    it('Plugins hooks have good context (mount)', async () => {
      await isMounted();
      await testContext('/plugins-hooks', '.context:not([ignore-server-client])');
    });
    return this;
  },
  client() {
    it('Plugins hooks have good context (client)', async () => {
      await gotoSPA('plugins-hooks');
      await testContext('/plugins-hooks');
    });
    return this;
  },
};

/**
 * Check plugins have right context (in routeError)
 */
export const pluginsErrorContext = {
  server() {
    it('Error: plugins hooks have good context (server)', async () => {
      const $ = await gotoSSR('/plugins-route-error/bar?bar=baz');
      testContextSSR($, '/plugins-route-error');
    });
    return this;
  },
  mount() {
    it('Error: plugins hooks have good context (mount)', async () => {
      await isMounted();
      await testContext('/plugins-route-error', '.context:not([ignore-server-client])');
    });
    return this;
  },
  client() {
    it('Error: plugins hooks have good context (client)', async () => {
      await gotoSPA('plugins-route-error');
      await testContext('/plugins-route-error');
    });
    return this;
  },
};

/**
 * Check redirect works
 */
export const redirect = {
  server() {
    it('Redirect works (server)', async () => {
      const $ = await gotoSSR('/redirect-route');
      expect($('h1').text()).toContain('UVue');
    });
    return this;
  },
  client() {
    it('Redirect works (client)', async () => {
      await gotoSPA('redirect-route');
      expect(await getText('h1')).toContain('UVue');
      await wait(200);
    });
    return this;
  },
  helper() {
    it('Redirect helper works (client)', async () => {
      await gotoSPA('redirect');

      const button = await page.$('button');
      await button.click();
      await wait(200);

      expect(await getText('h1')).toContain('UVue');
    });
    return this;
  },
};

/**
 * Vuex
 */
export const vuex = {
  server() {
    it('Vuex plugin is working (server)', async () => {
      const $ = await gotoSSR('/plugin-vuex');
      pageRunTestsSSR($);
    });
    return this;
  },
  mount() {
    it('Vuex plugin is working (mount)', async () => {
      await isMounted();
      await pageRunTests();
    });
    return this;
  },
  client() {
    it('Vuex plugin is working (client)', async () => {
      await gotoSPA('plugin-vuex');
      await pageRunTests();
    });
    return this;
  },
};

/**
 * Async data
 */
export const asyncData = {
  server() {
    it('asyncData plugin is working (server)', async () => {
      const $ = await gotoSSR('/plugin-async-data');
      pageRunTestsSSR($);
    });
    return this;
  },
  mount() {
    it('asyncData plugin is working (mount)', async () => {
      await isMounted();
      await pageRunTests();
    });
    return this;
  },
  client() {
    it('asyncData plugin is working (client)', async () => {
      await gotoSPA('plugin-async-data');
      await pageRunTests();
    });
    return this;
  },
};

/**
 * Middlewares
 */
export const middlewares = {
  server() {
    it('Middlewares plugin is working (server)', async () => {
      const $ = await gotoSSR('/plugin-middlewares');
      pageRunTestsSSR($);
    });
    return this;
  },
  mount() {
    it('Middlewares plugin is working (mount)', async () => {
      await isMounted();
      await pageRunTests();
    });
    return this;
  },
  client() {
    it('Middlewares plugin is working (client)', async () => {
      await gotoSPA('plugin-middlewares');
      await pageRunTests();
    });
    return this;
  },
};

/**
 * Error handler
 */
export const errorHandler = {
  server() {
    it('Error handler catch errors (server)', async () => {
      const $ = await gotoSSR('/plugin-error-route');
      pageRunTestsSSR($);

      expect($.DATA.errorHandler.error).toBeDefined();
      expect($.DATA.errorHandler.statusCode).toBe(403);

      const data = JSON.parse($('.error').text());

      expect(data.error).toBeDefined();
      expect(data.statusCode).toBe(403);
    });
    return this;
  },
  mount() {
    it('Error handler catch errors (mount)', async () => {
      await isMounted();
      await pageRunTests();

      const data = JSON.parse(await page.$eval('.error', el => el.textContent));

      expect(data.error).toBeDefined();
      expect(data.statusCode).toBe(403);
    });
    return this;
  },
  client() {
    it('Error handler catch errors (client)', async () => {
      await gotoSPA('plugin-error-route');
      await pageRunTests();

      const data = JSON.parse(await page.$eval('.error', el => el.textContent));

      expect(data.error).toBeDefined();
      expect(data.statusCode).toBe(403);
    });
    return this;
  },
  method() {
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
    return this;
  },
};
