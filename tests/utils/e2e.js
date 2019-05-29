const request = require('request');
const cheerio = require('cheerio');

const baseURL = 'http://localhost:7357';

/**
 * Do a HTTP request
 */
const doRequest = async (url, options) => {
  return new Promise(resolve => {
    request(
      {
        url,
        ...options,
      },
      (error, response, body) => {
        resolve({
          error,
          response,
          body,
        });
      },
    );
  });
};

const goto = async url => {
  await page.goto(`${baseURL}${url}`);
};

/**
 * Go to a page in SSR mode and get HTML content
 */
const gotoSSR = async url => {
  const response = await page.goto(`${baseURL}${url}`);
  const responseBody = await response.text();

  const $ = cheerio.load(responseBody);

  let scriptContent;

  const dataScript = $('script[data-vue-ssr-data]');
  if (dataScript.length) {
    scriptContent = dataScript.html().replace(/^window\.__DATA__=/, '');
  }

  if (scriptContent && scriptContent !== 'undefined') {
    $.DATA = JSON.parse(scriptContent);
  } else {
    $.DATA = {};
  }

  return $;
};

/**
 * Do a SPA navigation
 */
const gotoSPA = async name => {
  await page.goto(`${baseURL}/`);
  await isMounted();
  const link = await page.$(`a[data-route-name="${name}"]`);
  await link.click();
  await wait(100);
};

/**
 * Check the current page is in SPA mode
 */
const isSPA = async () => {
  return (await page.$('script[data-vue-spa]')) !== null;
};

/**
 * Check Vue app is mounted
 */
const isMounted = async () => {
  return page.waitForFunction('document.querySelector("#mounted") != null');
};

/**
 * Get text in DOM element
 */
const getText = selector => {
  return page.$eval(selector, el => el.textContent);
};

/**
 * Check text in DOM element
 */
const checkText = async (selector, value) => {
  expect(await page.$eval(selector, el => el.textContent)).toBe(value);
};

/**
 * Run tests contained in page
 */
const pageRunTests = async (selector = '.test') => {
  const tests = await page.evaluate(selector => {
    const elements = Array.from(document.querySelectorAll(selector));
    return elements.map(item => {
      return {
        expected: item.querySelector('.expected .value').textContent,
        result: item.querySelector('.result .value').textContent,
      };
    });
  }, selector);

  for (const test of tests) {
    expect(test.result).toBe(test.expected);
  }
};

/**
 * Run tests contained in page (SSR mode, with HTML source code)
 */
const pageRunTestsSSR = ($, selector = '.test') => {
  $(selector).each((_, element) => {
    const expected = $('.expected .value', element).text();
    const result = $('.result .value', element).text();
    expect(result).toBe(expected);
  });
};

const testContext = async (path, selector = '.context') => {
  const contexts = await page.evaluate(selector => {
    const elements = Array.from(document.querySelectorAll(selector));
    return elements.map(item => {
      try {
        return JSON.parse(item.textContent);
      } catch (err) {
        return {};
      }
    });
  }, selector);

  for (const data of contexts) {
    for (const key in data) {
      if (key === 'route') {
        const route = data[key];
        if (route.hook && /^route/.test(route.hook)) {
          if (route.url) {
            expect(route.url).toBe(`${path}/bar?bar=baz`);
          }
          if (route.query) {
            expect(route.query).toEqual({
              bar: 'baz',
            });
          }
          if (route.params) {
            expect(route.params).toEqual({
              foo: 'bar',
            });
          }
        }
      } else {
        expect(data[key]).toBe(true);
      }
    }
  }
};

const testContextSSR = ($, path) => {
  $('.context').each((index, element) => {
    let data;

    try {
      data = JSON.parse($(element).text());
    } catch (err) {
      data = {};
    }

    for (const key in data) {
      if (key === 'route') {
        const route = data[key];
        if (route.hook && /^route/.test(route.hook)) {
          if (route.url) {
            expect(route.url).toBe(`${path}/bar?bar=baz`);
          }
          if (route.query) {
            expect(route.query).toEqual({
              bar: 'baz',
            });
          }
          if (route.params) {
            expect(route.params).toEqual({
              foo: 'bar',
            });
          }
        }
      } else {
        expect(data[key]).toBe(true);
      }
    }
  });
};

/**
 * Simple function to wait
 */
const wait = time => new Promise(resolve => setTimeout(resolve, time));

module.exports = {
  wait,
  goto,
  gotoSSR,
  gotoSPA,
  baseURL,
  doRequest,
  isSPA,
  isMounted,
  getText,
  checkText,
  pageRunTests,
  pageRunTestsSSR,
  testContext,
  testContextSSR,
};
