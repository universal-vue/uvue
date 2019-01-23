const HtmlWebpack = require('html-webpack-plugin');
const WebpackBar = require('webpackbar');
const cssConfig = require('./css');
const defineOptions = require('./defineOptions');
const merge = require('lodash/merge');

module.exports = (api, options = {}) => {
  const opts = Object.assign({ client: true, ssr: true }, options);
  const { client, host, port, serve } = opts;

  // Get base config from SPA
  const chainConfig = api.resolveChainableWebpackConfig();

  const uvueDir = api.uvue.getServerConfig('uvueDir');

  // Change template for HTMLWebpackPlugin
  let htmlOptions = {
    template: api.resolve(api.uvue.getConfig('paths.template')),
    filename: `${uvueDir}/ssr.html`,
  };

  // Override HTMLWebpackPlugin behavior
  chainConfig.plugin('html').tap(args => {
    const params = merge({}, args[0].templateParameters || {}, {
      uvue: opts,
    });

    return [
      merge({}, args[0] || {}, htmlOptions, {
        filename: `${uvueDir}/ssr.html`,
        inject: false,
        templateParameters: params,
      }),
    ];
  });

  // Add a index template for SPA pages
  chainConfig.plugin('html-spa').use(HtmlWebpack, [
    merge({}, htmlOptions, {
      filename: `${uvueDir}/spa.html`,
      inject: true,
      templateParameters: merge({}, htmlOptions.templateParameters, {
        uvue: {
          ssr: false,
          client: true,
        },
      }),
    }),
  ]);

  // Ignore copying base index.html
  chainConfig.plugin('copy').tap(args => {
    const items = args[0];

    for (const item of items) {
      if (item.from == api.resolve('public')) {
        const ignore = item.ignore || [];
        ignore.push('index.html');

        item.ignore = ignore;
      }
    }
  });

  // Friendly Errors with server URL
  chainConfig.plugin('friendly-errors').tap(args => {
    const messages = [];

    if (host && port) {
      const httpsConfig = api.uvue.getServerConfig('https');
      messages.push(
        `Server is running: ${
          httpsConfig.key && httpsConfig.cert ? 'https' : 'http'
        }://${host}:${port}`,
      );
    }

    if (serve) messages.push(`Type "rs" to restart server`);

    args[0].compilationSuccessInfo = {
      messages,
    };
    return args;
  });

  if (!client) {
    chainConfig.plugins.delete('friendly-errors');
  }

  // Remove default plugins
  chainConfig.plugins.delete('no-emit-on-errors');
  chainConfig.plugins.delete('progress');

  // Add Webpack Bar
  chainConfig
    .plugin('webpack-bar')
    .use(WebpackBar, [{ name: 'Client', color: 'green' }])
    .before('vue-loader');

  // CSS management
  cssConfig(api, chainConfig, client);

  // Replace define plugin configuration
  chainConfig.plugin('uvue-defines').tap(args => {
    args[0] = defineOptions({
      client,
      ssr: true,
    });
    return args;
  });

  if (client) {
    return require('./client')(api, chainConfig);
  } else {
    return require('./server')(api, chainConfig);
  }
};
