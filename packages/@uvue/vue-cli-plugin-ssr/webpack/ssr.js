const HtmlWebpack = require('html-webpack-plugin');
const WebpackBar = require('webpackbar');
const cssConfig = require('./css');
const defineOptions = require('./defineOptions');
const merge = require('lodash/merge');

module.exports = (api, options = {}) => {
  const opts = Object.assign({ client: true, ssr: true }, options);
  const { client, host, port } = opts;

  // Get base config from SPA
  const chainConfig = api.resolveChainableWebpackConfig();

  // Change template for HTMLWebpackPlugin
  let htmlOptions = {
    template: api.resolve(api.uvue.getConfig('paths.template')),
    filename: 'uvue/ssr.html',
  };

  // Override HTMLWebpackPlugin behavior
  chainConfig.plugin('html').tap(args => {
    const params = merge({}, args[0].templateParameters || {}, {
      uvue: opts,
    });

    return [
      merge({}, args[0] || {}, htmlOptions, {
        filename: '.uvue/ssr.html',
        inject: false,
        templateParameters: params,
      }),
    ];
  });

  // Add a index template for SPA pages
  chainConfig.plugin('html-spa').use(HtmlWebpack, [
    merge({}, htmlOptions, {
      filename: '.uvue/spa.html',
      inject: true,
      templateParameters: merge({}, htmlOptions.templateParameters, {
        uvue: {
          ssr: false,
          client: true,
        },
      }),
    }),
  ]);

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

    args[0].compilationSuccessInfo = {
      messages,
    };
    return args;
  });

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
