const { IpcMessenger } = require('@vue/cli-shared-utils');

const defaults = {
  host: 'localhost',
  port: 8080,
};

const modifyConfig = (config, fn) => {
  if (Array.isArray(config)) {
    config.forEach(c => fn(c));
  } else {
    fn(config);
  }
};

let ipc;

module.exports = (api, options) => {
  api.registerCommand(
    'ssr:serve-run',
    {
      description: 'start development server (SSR) without nodemon reloading',
      usage: 'vue-cli-service ssr:serve-run [options]',
      options: {
        '--mode': `specify env mode (default: development)`,
        '--host': `specify host (default: ${defaults.host})`,
        '--port': `specify port (default: ${defaults.port})`,
      },
    },
    async function(args) {
      const projectDevServerOptions = options.devServer || {};

      // Gettings host & port
      const portfinder = require('portfinder');
      const host = args.host || process.env.HOST || projectDevServerOptions.host || defaults.host;
      portfinder.basePort =
        args.port || process.env.PORT || projectDevServerOptions.port || defaults.port;
      const port = await portfinder.getPortPromise();

      // Start server
      await startServer({ api, host, port, args });
    },
  );
};

async function startServer({ api, host, port, args }) {
  const { Server } = require('@uvue/server');
  Server.loadEnv(args.mode || process.env.NODE_ENV);

  const getWebpackConfig = require('../webpack/ssr');

  const {
    adapter,
    adapterArgs,
    uvueDir,
    https,
    devServer,
    spaPaths,
    renderer,
    logger,
  } = api.uvue.getServerConfig();

  const serverConfig = getWebpackConfig(api, { serve: true, client: false, host, port });
  const clientConfig = getWebpackConfig(api, { serve: true, client: true, host, port });

  // Expose advanced stats
  if (args.dashboard) {
    const DashboardPlugin = require('@vue/cli-service/lib/webpack/DashboardPlugin');
    modifyConfig(clientConfig, config => {
      config.plugins.push(
        new DashboardPlugin({
          type: 'ssr-serve',
        }),
      );
    });
  }

  // Create server
  const server = new Server({
    adapter,
    adapterArgs,
    logger,
    uvueDir,

    // Set webpakc config for webpack compiler
    webpack: {
      client: clientConfig,
      server: serverConfig,
    },

    // Set server configuration
    httpOptions: {
      host,
      port,
      https,
    },

    // Dev server options
    devServer,

    // From config file
    spaPaths,
    renderer,
  });

  // Install plugins
  api.uvue.installServerPlugins(server);

  // Start server
  await server.start();

  if (args.dashboard) {
    // Send final app URL
    ipc = new IpcMessenger();
    ipc.connect();
    ipc.send({
      vueServe: {
        url: `http://${host}:${port}`,
      },
    });
  }

  return server;
}
