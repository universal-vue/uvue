const request = require('request');
const cheerio = require('cheerio');

const baseURL = 'http://localhost:8080';

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

/**
 * Go to a page in SSR mode and get HTML content
 */
const gotoSSR = async url => {
  const response = await page.goto(url);
  const responseBody = await response.text();

  const $ = cheerio.load(responseBody);

  const dataTag = $('script[data-vue-ssr-data]');
  const scriptContent = $('script[data-vue-ssr-data]')
    .html()
    .replace(/^window\.__DATA__=/, '');

  if (scriptContent && scriptContent !== 'undefined') {
    $.DATA = JSON.parse(scriptContent);
  } else {
    $.DATA = {};
  }

  return $;
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
  return page.waitForFunction('document.querySelector("#mounted") != null;');
};

/**
 * Click on a link to go to page
 */
const gotoClick = async name => {
  const link = await page.$(`a[data-route-name="${name}"]`);
  await link.click();
  await wait(100);
};

/**
 * Check text in DOM element
 */
const checkText = async (selector, value) => {
  expect(await page.$eval(selector, el => el.textContent)).toBe(value);
};

/**
 * Run page test
 */
const pageTest = async () => {
  const expected = await page.$eval('.test .expected .value', el => el.textContent);
  const value = await page.$eval('.test .result .value', el => el.textContent);
  expect(value).toBe(expected);
};

/**
 * Run page test on HTML (SSR)
 */
const pageTestSSR = async $ => {
  const expected = $('.test .expected .value').text();
  const value = $('.test .result .value').text();
  expect(value).toBe(expected);
};

/**
 * Simple function to wait
 */
const wait = time => new Promise(resolve => setTimeout(resolve, time));

module.exports = {
  gotoSSR,
  baseURL,
  doRequest,
  isSPA,
  isMounted,
  gotoClick,
  checkText,
  pageTest,
  pageTestSSR,
  wait,
};
