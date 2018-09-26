#!/usr/bin/env node
require = require('esm')(module);
const yargs = require('yargs');
const { exists } = require('fs-extra');
const { resolve } = require('path');
const { Server } = require('@uvue/server');

// CLI args
const argv = yargs
  .option('c', {
    alias: 'config',
    default: 'server.config.js',
    describe: 'Determine a path to your configuration file',
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

  /**
   * Create server
   */
  const server = new Server({
    // Set files destinations
    paths: {
      outputDir: resolve('dist'), // TODO: find a way to configure this
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
      https: options.https,
    },
  });

  // Install plugins from config
  if (options.plugins) {
    for (const pluginDef of options.plugins) {
      if (typeof pluginDef === 'string') {
        const plugin = require(pluginDef);
        server.addPlugin(plugin.default || plugin, pluginDef[1]);
      } else if (Array.isArray(pluginDef)) {
        const plugin = require(pluginDef[0]);
        server.addPlugin(plugin.default || plugin, pluginDef[1]);
      }
    }
  }

  /**
   * Start server
   */
  await server.start();

  console.log(
    `Server listening: ${server.getAdapter().isHttps() ? 'https' : 'http'}://${host}:${port}`,
  );
})().catch(err => {
  console.error(err);
  process.exit(1);
});
