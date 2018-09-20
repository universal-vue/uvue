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
        '--modern': `build two bundle: legacy and modern`,
      },
    },
    async function(args) {
      // Remove previous build
      await fs.remove(api.resolve(options.outputDir));

      if (!args.modern) {
        await build(api, options, args);
      } else {
        process.env.VUE_CLI_MODERN_MODE = true;
        delete process.env.VUE_CLI_MODERN_BUILD;

        // eslint-disable-next-line
        console.log('Building legacy bundle...');
        await build(api, options, args);

        // eslint-disable-next-line
        console.log('Building modern bundle...');
        process.env.VUE_CLI_MODERN_BUILD = true;
        await build(api, options, args);

        delete process.env.VUE_CLI_MODERN_MODE;
        delete process.env.VUE_CLI_MODERN_BUILD;
      }
    },
  );
};

function build(api, options, args) {
  return new Promise(async (resolve, reject) => {
    const isLegacyBuild = !process.env.VUE_CLI_MODERN_BUILD && process.env.VUE_CLI_MODERN_MODE;

    // Get Webpakc configurations
    const getWebpackConfig = require('../webpack/ssr');
    const clientConfig = getWebpackConfig(api, { client: true });
    const serverConfig = getWebpackConfig(api, { client: false });

    // Add bundle analyzer if asked
    if (args.report || args['report-json']) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      modifyConfig(clientConfig, config => {
        const bundleName =
          args.target !== 'app'
            ? config.output.filename.replace(/\.js$/, '-')
            : isLegacyBuild
              ? 'legacy-'
              : '';
        config.plugins.push(
          new BundleAnalyzerPlugin({
            logLevel: 'warn',
            openAnalyzer: false,
            analyzerMode: args.report ? 'static' : 'disabled',
            reportFilename: `${bundleName}report.html`,
            statsFilename: `${bundleName}report.json`,
            generateStatsFile: !!args['report-json'],
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
        return reject(err);
      }

      // eslint-disable-next-line
      console.log(`\n` + formatStats(stats, options.outputDir, api));
      resolve();
    };

    // Start compilation
    compiler.run(onCompilationComplete);
  });
}
