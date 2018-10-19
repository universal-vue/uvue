const fs = require('fs-extra');
const webpack = require('webpack');
const consola = require('consola');
const formatStats = require('@vue/cli-service/lib/commands/build/formatStats');
const StaticGenerate = require('../uvue/StaticGenerate');

const modifyConfig = (config, fn) => {
  if (Array.isArray(config)) {
    config.forEach(c => fn(c));
  } else {
    fn(config);
  }
};

module.exports = (api, options) => {
  api.registerCommand(
    'ssr:static',
    {
      description: 'build a static website',
      usage: 'vue-cli-service ssr:static [options]',
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

        consola.start('Building legacy bundle...');
        await build(api, options, args);

        consola.start('Building modern bundle...');
        process.env.VUE_CLI_MODERN_BUILD = true;
        await build(api, options, args);

        delete process.env.VUE_CLI_MODERN_MODE;
        delete process.env.VUE_CLI_MODERN_BUILD;
      }

      // Start static generation
      const staticGenerate = new StaticGenerate(api, options);
      await staticGenerate.run();
    },
  );
};

function build(api, options, args) {
  return new Promise(async (resolve, reject) => {
    const isLegacyBuild = !process.env.VUE_CLI_MODERN_BUILD && process.env.VUE_CLI_MODERN_MODE;
    const isModernBuild = process.env.VUE_CLI_MODERN_MODE && process.env.VUE_CLI_MODERN_BUILD;

    // Get Webpakc configurations
    const getWebpackConfig = require('../webpack/ssr');
    const clientConfig = getWebpackConfig(api, { client: true });
    const serverConfig = getWebpackConfig(api, { client: false });

    // Expose advanced stats
    if (args.dashboard) {
      const DashboardPlugin = require('@vue/cli-service/lib/webpack/DashboardPlugin');
      modifyConfig(clientConfig, config => {
        config.plugins.push(
          new DashboardPlugin({
            type: !isModernBuild ? 'ssr-build' : 'ssr-build-modern',
            modernBuild: isModernBuild,
          }),
        );
      });
    }

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
        consola.error(err);
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
