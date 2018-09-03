const fs = require('fs-extra');
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
      /**
       * Check files before start
       */
      try {
        existsSync(api.resolve(join(options.outputDir, 'uvue/server-bundle.json')));
        existsSync(api.resolve(join(options.outputDir, 'uvue/client-manifest.json')));
        existsSync(api.resolve(join(options.outputDir, 'uvue/ssr.html')));
      } catch (err) {
        // eslint-disable-next-line
        console.error('Incorrect SSR build, did you run "ssr:build" command before ?');
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
      const { Server } = require('@uvue/server');

      const server = new Server({
        // Set files destinations
        paths: {
          outputDir: api.resolve(options.outputDir),
          serverBundle: 'uvue/server-bundle.json',
          clientManifest: 'uvue/client-manifest.json',
          templates: {
            spa: 'uvue/spa.html',
            ssr: 'uvue/ssr.html',
          },
        },

        // Set server configuration
        httpOptions: {
          host,
          port,
        },
      });

      // eslint-disable-next-line
      console.log(`Server listening: http://${host}:${port}`);

      /**
       * Start server
       */
      await server.start();
    },
  );
};
