#!/usr/bin/env node
require = require('esm')(module);
const yargs = require('yargs');
const { exists } = require('fs-extra');
const { resolve } = require('path');
const { Server } = require('@uvue/server');

const pluginPath = srcPath => {
  if (/^\./.test(srcPath)) {
    return resolve(srcPath);
  }
  return srcPath;
};

// CLI args
const argv = yargs
  .option('c', {
    alias: 'config',
    default: 'server.config.js',
    describe: 'Give a path to your server configuration file',
    type: 'string',
  })
  .option('h', {
    alias: 'host',
    default: process.env.HOST || '0.0.0.0',
    describe: 'Set listen host',
    type: 'string',
  })
  .option('p', {
    alias: 'port',
    default: process.env.PORT || 8080,
    describe: 'Set listen port',
    type: 'number',
  })
  .option('d', {
    alias: 'dist',
    default: 'dist',
    describe: 'Give the path to your dist folder',
  })
  .help().argv;

// Force production mode
process.env.NODE_ENV = 'production';

// Start function
(async () => {
  const { host, port } = argv;

  // Load config from current project
  let options = {};
  if (await exists(resolve(argv.config))) {
    options = require(resolve(argv.config)).default;
  }

  const { adapter, https, spaPaths, renderer, logger } = options;

  /**
   * Create server
   */
  const server = new Server({
    adapter,
    logger,

    // Set files destinations
    paths: {
      outputDir: resolve(argv.dist),
      serverBundle: '.uvue/server-bundle.json',
      clientManifest: '.uvue/client-manifest.json',
      templates: {
        spa: '.uvue/spa.html',
        ssr: '.uvue/ssr.html',
      },
    },

    // Set server configuration
    httpOptions: {
      host,
      port,
      https,
    },

    // From config file
    spaPaths,
    renderer,
  });

  // Install plugins from config
  if (options.plugins) {
    for (const pluginDef of options.plugins) {
      if (typeof pluginDef === 'string') {
        const plugin = require(pluginPath(pluginDef));
        server.addPlugin(plugin.default || plugin);
      } else if (Array.isArray(pluginDef)) {
        const plugin = require(pluginPath(pluginDef[0]));
        server.addPlugin(plugin.default || plugin, pluginDef[1]);
      }
    }
  }

  /**
   * Start server
   */
  await server.start();
})().catch(err => {
  server.logger.error(err);
  process.exit(1);
});
