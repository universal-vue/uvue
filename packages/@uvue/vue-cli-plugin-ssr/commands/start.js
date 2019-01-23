const fs = require('fs-extra');
const consola = require('consola');
const { join } = require('path');

const defaults = {
  host: '0.0.0.0',
  port: 8080,
};

const existsSync = filepath => {
  if (!fs.existsSync(filepath)) throw new Error(`${filepath} doesnt exists`);
};

module.exports = (api, options) => {
  api.registerCommand(
    'ssr:start',
    {
      description: 'start production server (SSR)',
      usage: 'vue-cli-service ssr:start [options]',
      options: {
        '--host': `specify host (default: ${defaults.host})`,
        '--port': `specify port (default: ${defaults.port})`,
      },
    },
    async function(args) {
      const serverConfig = api.uvue.getServerConfig();
      const { uvueDir } = serverConfig;

      /**
       * Check files before start
       */
      try {
        existsSync(api.resolve(join(options.outputDir, uvueDir, 'server-bundle.json')));
        existsSync(api.resolve(join(options.outputDir, uvueDir, 'client-manifest.json')));
        existsSync(api.resolve(join(options.outputDir, uvueDir, 'ssr.html')));
      } catch (err) {
        // eslint-disable-next-line
        consola.fatal('Incorrect SSR build, did you run "ssr:build" command before ?');
        process.exit(1);
      }

      /**
       * Get host & port
       */
      const host = args.host || process.env.HOST || defaults.host;

      const portfinder = require('portfinder');
      portfinder.basePort = args.port || process.env.PORT || defaults.port;

      const port = await portfinder.getPortPromise();

      // Force production mode
      process.env.NODE_ENV = 'production';

      /**
       * Create server
       */
      const { adapter, https, spaPaths, renderer, logger } = serverConfig;
      const { Server } = require('@uvue/server');

      const server = new Server({
        distPath: api.resolve(options.outputDir),
        uvueDir,
        adapter,
        logger,

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

      // Install plugins
      api.uvue.installServerPlugins(server);

      /**
       * Start server
       */
      await server.start();
    },
  );
};
