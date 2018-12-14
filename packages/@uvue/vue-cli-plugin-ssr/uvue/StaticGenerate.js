const fs = require('fs-extra');
const mm = require('micromatch');
const chalk = require('chalk');
const httpMocks = require('node-mocks-http');
const { dirname } = require('path');
const { merge } = require('lodash');
const { Server } = require('@uvue/server');

const whiteBox = str => chalk.bgWhite(chalk.black(` ${str} `));
const greenBox = str => chalk.bgGreen(chalk.black(` ${str} `));
const yellowBox = str => chalk.bgYellow(chalk.black(` ${str} `));
const redBox = str => chalk.bgRed(chalk.black(` ${str} `));
const blueBox = str => chalk.bgBlue(chalk.black(` ${str} `));

module.exports = class StaticGenerate {
  constructor(api, options) {
    this.api = api;
    this.options = options;

    // Fake server to resolve renderer
    this.server = new Server({
      paths: {
        outputDir: api.resolve(options.outputDir),
        serverBundle: '.uvue/server-bundle.json',
        clientManifest: '.uvue/client-manifest.json',
        templates: {
          spa: '.uvue/spa.html',
          ssr: '.uvue/ssr.html',
        },
      },
    });

    // Install plugins
    api.uvue.installServerPlugins(this.server);

    // Renderer
    this.renderer = this.server.createRenderer(this.server.getBuiltFiles());

    // Generate config
    this.staticConfig = merge(
      {},
      {
        scanRouter: true,
        params: null,
        paths: [],
      },
      api.uvue.getServerConfig('static'),
    );

    // Get SPA paths from config
    this.spaPaths = api.uvue.getServerConfig('spaPaths') || [];
  }

  /**
   * Run static generator
   */
  async run() {
    await this.server.invokeAsync('beforeStart', this.server);

    let paths = Array.from(this.staticConfig.paths);

    if (this.staticConfig.scanRouter) {
      paths = paths.concat(await this.scanRouter());
    }

    if (this.staticConfig.params) {
      paths = this.generatePathsParams(paths, this.staticConfig.params);
    }

    // Dedupe array
    paths = Array.from(new Set(paths));

    process.stdout.write(whiteBox(`Generating ${paths.length} routes...`) + `\n`);

    for (const path of paths) {
      await this.buildPage(path);
    }
  }

  /**
   * Create a fake context for renderer
   */
  createRequestContext(url) {
    // Fake IncomingRequest
    const req = httpMocks.createRequest({
      method: 'GET',
      url,
    });

    // Fake ServerResponse
    const res = httpMocks.createResponse();
    res.__body = '';
    res.write = chunk => {
      res.__body += chunk;
    };
    res.end = data => {
      if (data) {
        res.__body = data;
      }
    };

    return {
      url,
      req,
      res,
      redirected: false,
      statusCode: 200,
      bodyAdd: '',
      headAdd: '',
      data: {},
    };
  }

  /**
   * Fetch home page to get router instance
   */
  async scanRouter(path = '/') {
    // Call page
    const context = this.createRequestContext(path);
    await this.renderer.render(context);

    // Get routes from router
    const routes = context.router.options.routes;

    return this.buildRoutesPaths(routes);
  }

  /**
   * Build all paths from a router scan
   */
  buildRoutesPaths(routes, parentPath = '') {
    let results = [];

    for (const route of routes) {
      // Manage children routes paths
      let routePath = /^\//.test(route.path) ? route.path : `${parentPath}/${route.path}`;

      // Wildcard root path => suppose it's a 404 page
      if (route.path === '*' && parentPath === '') routePath = '/404';

      // Remove trailing slash
      const finalPath = routePath.replace(/(.+)\/$/, '$1');

      if (finalPath !== '') {
        results.push(finalPath);
      }

      // If children: search recursivly
      if (route.children) {
        results = [].concat(results, this.buildRoutesPaths(route.children, routePath));
      }
    }

    return results;
  }

  /**
   * Build paths with supplied params
   */
  generatePathsParams(paths, params = {}) {
    const newPaths = [];

    for (const paramName in params) {
      const paramValues = params[paramName];
      paths.forEach(pagePath => {
        const regexp = new RegExp(`/:${paramName}`);
        if (regexp.exec(pagePath)) {
          for (const value of paramValues) {
            const finalPath = pagePath.replace(regexp, value ? `/${value}` : '');
            if (finalPath !== '') newPaths.push(finalPath);
          }
        } else {
          newPaths.push(pagePath);
        }
      });
    }

    return newPaths;
  }

  async buildPage(path) {
    let status = null;

    // Tests for forbidden characters
    const forbiddenChars = /[:\\+*?()[]]*/g;

    if (!forbiddenChars.test(path)) {
      // SSR route
      const context = this.createRequestContext(path);

      // Plugins hook
      await this.server.invokeAsync('beforeRender', context, this.server);

      if (this.spaPaths.length && mm.some(path, this.spaPaths)) {
        // SPA route
        status = await this.buildSPAPage(path);
      } else {
        // Render page
        status = await this.buildSSRPage(context);
      }

      let boxFunc = greenBox;
      if (status === 'SPA') {
        boxFunc = blueBox;
      } else if (status >= 300 && status < 400) {
        boxFunc = yellowBox;
      } else if (status >= 400) {
        boxFunc = redBox;
      }

      process.stdout.write(`${boxFunc(status)}\t${path}\n`);
    } else {
      process.stdout.write(`${redBox('SKP')}\t${path}\n`);
    }
  }

  async buildSSRPage(context) {
    const { res } = context;

    const response = {
      body: '',
      status: null,
    };

    const writePage = async (context, response) => {
      if (!/\.html?$/.test(context.url)) {
        await fs.ensureDir(`${this.options.outputDir}/${context.url}`);
        await fs.writeFileSync(
          `${this.options.outputDir}/${context.url}/index.html`,
          response.body,
        );
      } else {
        await fs.ensureDir(`${this.options.outputDir}/${dirname(context.url)}`);
        await fs.writeFileSync(`${this.options.outputDir}/${context.url}`, response.body);
      }
    };

    if (res.finished) {
      await writePage(context, { body: res.__body });
      return response.status || res.statusCode || 200;
    }

    try {
      // Render body
      response.body = await this.renderer.render(context);
      response.status = context.statusCode;

      if (context.redirected) {
        // Manage redirect
        const url = context.res.__body;
        if (!/https?:\/\//.test(url)) {
          response.body = this.redirectPage(context.res.__body);
          response.status = context.redirected;
        } else {
          return;
        }
      } else {
        // Plugins hook
        await this.server.invokeAsync('beforeBuild', response, context, this.server);

        if (res.finished) {
          await writePage(context, { body: res.__body });
          return response.status || res.statusCode || 200;
        }

        // Render all page
        response.body = await this.renderer.renderSSRPage(response.body, context);

        // Hook on rendered
        await this.server.invokeAsync('rendered', response, context, this.server);

        if (res.finished) {
          await writePage(context, { body: res.__body });
          return response.status || res.statusCode || 200;
        }
      }
    } catch (err) {
      // Catch errors
      await this.server.invokeAsync('routeError', err, response, context, this.server);

      if (res.finished) {
        await writePage(context, { body: res.__body });
        return response.status || res.statusCode || 500;
      }

      response.body = response.body || 'Server error';
      response.status = 500;
    }

    await writePage(context, response);
    return response.status || 200;
  }

  async buildSPAPage(path) {
    await fs.ensureDir(`${this.options.outputDir}/${path}`);
    await fs.writeFileSync(
      `${this.options.outputDir}/${path}/index.html`,
      await this.renderer.renderSPAPage(),
    );
    return 'SPA';
  }

  redirectPage(url) {
    return `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0; url=${url}" />
</head>
<body>Redirecting...</body>
</html>`;
  }
};
