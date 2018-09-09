const HtmlWebpack = require('html-webpack-plugin');
const WebpackBar = require('webpackbar');
const cssConfig = require('./css');
const defineOptions = require('./defineOptions');

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
    const params = {
      ...(args[0].templateParameters || {}),
      uvue: opts,
    };

    htmlOptions = {
      ...args[0],
      ...htmlOptions,
      filename: '.uvue/ssr.html',
      inject: false,
      templateParameters: params,
    };

    return [htmlOptions];
  });

  // Add a index template for SPA pages
  chainConfig.plugin('html-spa').use(HtmlWebpack, [
    {
      ...htmlOptions,
      filename: '.uvue/spa.html',
      inject: true,
      templateParameters: {
        ...htmlOptions.templateParameters,
        neue: {
          ssr: false,
          client: true,
        },
      },
    },
  ]);

  // Friendly Errors with server URL
  chainConfig.plugin('friendly-errors').tap(args => {
    const messages = [];

    if (host && port) {
      // TODO: detect https

      const protocol = 'http';
      messages.push(`Server is running: ${protocol}://${host}:${port}`);
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
  cssConfig(api, chainConfig);

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
