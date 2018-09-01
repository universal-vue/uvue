const HtmlWebpack = require('html-webpack-plugin');
const WebpackBar = require('webpackbar');
const cssConfig = require('./css');
const defineOptions = require('./defineOptions');

module.exports = (api, options = {}) => {
  const opts = Object.assign({ client: true, ssr: true }, options);
  const { client } = opts;

  // Get base config from SPA
  const chainConfig = api.resolveChainableWebpackConfig();

  // Change template for HTMLWebpackPlugin
  let htmlOptions = {
    template: api.resolve('index.html'),
    filename: 'assets/ssr.html',
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
      filename: 'assets/ssr.html',
      inject: false,
      templateParameters: params,
    };

    return [htmlOptions];
  });

  // Add a index template for SPA pages
  chainConfig.plugin('html-spa').use(HtmlWebpack, [
    {
      ...htmlOptions,
      filename: 'assets/spa.html',
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

    // TODO: get port & host
    // if (opts.host && opts.port) {
    //   const https = this.getServerConfig('https');
    //   const protocol = https && https.key && https.key ? 'https' : 'http';
    //   messages.push(`Server is running: ${protocol}://${opts.host}:${opts.port}`);
    // }

    args[0].compilationSuccessInfo = {
      messages,
    };
    return args;
  });

  chainConfig.plugins.delete('friendly-errors');

  // Remove default progress bar
  chainConfig.plugins.delete('progress');

  // Add Webpack Bar
  // chainConfig
  //   .plugin('webpack-bar')
  //   .use(WebpackBar, [{ name: 'Client', color: 'green' }])
  //   .before('vue-loader');

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
