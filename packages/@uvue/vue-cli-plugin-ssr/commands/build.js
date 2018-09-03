const fs = require('fs-extra');
const webpack = require('webpack');
const formatStats = require('@vue/cli-service/lib/commands/build/formatStats');

const modifyConfig = (config, fn) => {
  if (Array.isArray(config)) {
    config.forEach(c => fn(c));
  } else {
    fn(config);
  }
};

module.exports = (api, options) => {
  api.registerCommand(
    'ssr:build',
    {
      description: 'build for production (SSR)',
      usage: 'vue-cli-service ssr:build [options]',
      options: {
        '--mode': `specify env mode (default: production)`,
        '--report': `generate report to help analyze bundle content`,
        '--watch': `watch for changes`,
      },
    },
    async function(args) {
      // Get Webpakc configurations
      const getWebpackConfig = require('../webpack/ssr');
      const clientConfig = getWebpackConfig(api, { client: true });
      const serverConfig = getWebpackConfig(api, { client: false });

      // Remove previous build
      await fs.remove(api.resolve(options.outputDir));

      // Add bundle analyzer if asked
      if (args.report || args['report-json']) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        modifyConfig(clientConfig, config => {
          config.plugins.push(
            new BundleAnalyzerPlugin({
              logLevel: 'warn',
              openAnalyzer: false,
              analyzerMode: args.report ? 'static' : 'disabled',
              reportFilename: `report.html`,
              statsFilename: `report.json`,
              generateStatsFile: true,
            }),
          );
        });
      }

      // Create compiler
      const compiler = webpack([clientConfig, serverConfig]);

      // When compilation is done
      const onCompilationComplete = (err, stats) => {
        if (err) {
          // eslint-disable-next-line
          console.error(err);
          return;
        }
        // eslint-disable-next-line
        console.log(`\n` + formatStats(stats, options.outputDir, api));
      };

      if (args.watch) {
        // Start in watch mode
        compiler.watch({}, onCompilationComplete);
      } else {
        // Start unique build
        compiler.run(onCompilationComplete);
      }
    },
  );
};
