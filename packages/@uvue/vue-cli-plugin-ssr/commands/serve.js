const defaults = {
  host: '127.0.0.1',
  port: 8080,
};

module.exports = (api, options) => {
  api.registerCommand(
    'ssr:serve',
    {
      description: 'start development server (SSR)',
      usage: 'vue-cli-service ssr:serve [options]',
      options: {
        '--mode': `specify env mode (default: development)`,
        '--host': `specify host (default: ${defaults.host})`,
        '--port': `specify port (default: ${defaults.port})`,
      },
    },
    async function(args) {
      const projectDevServerOptions = options.devServer || {};

      /**
       * Gettings host & port
       */
      const portfinder = require('portfinder');
      const host = args.host || process.env.HOST || projectDevServerOptions.host || defaults.host;
      portfinder.basePort =
        args.port || process.env.PORT || projectDevServerOptions.port || defaults.port;
      const port = await portfinder.getPortPromise();

      /**
       * Create server
       */
      const { Server } = require('@uvue/server');
      const getWebpackConfig = require('../webpack/ssr');

      const server = new Server({
        // Set files destinations
        paths: {
          serverBundle: 'uvue/server-bundle.json',
          clientManifest: 'uvue/client-manifest.json',
          templates: {
            spa: 'uvue/spa.html',
            ssr: 'uvue/ssr.html',
          },
        },

        // Set webpakc config for webpack compiler
        webpack: {
          client: getWebpackConfig(api, { client: true, host, port }),
          server: getWebpackConfig(api, { client: false, host, port }),
        },

        // Set server configuration
        httpOptions: {
          host,
          port,
        },
      });

      /**
       * Start server
       */
      await server.start();
    },
  );
};
