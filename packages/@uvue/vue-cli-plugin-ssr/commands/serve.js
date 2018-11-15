const { IpcMessenger } = require('@vue/cli-shared-utils');
const consola = require('consola');

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

let server;
let reloading = false;
let reloadQueued = false;

const reloadServer = async (server, { api, host, port, args }) => {
  if (reloading) {
    consola.warn('Reload queued!');
    reloadQueued = true;
    return;
  }
  reloading = true;

  if (server) {
    await server.stop();
    server = null;
  }
  return startServer({ api, host, port, args });
};

let ipc = null;

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
      const consola = require('consola');
      const chokidar = require('chokidar');

      const { watch } = api.uvue.getServerConfig();
      const projectDevServerOptions = options.devServer || {};

      // Gettings host & port
      const portfinder = require('portfinder');
      const host = args.host || process.env.HOST || projectDevServerOptions.host || defaults.host;
      portfinder.basePort =
        args.port || process.env.PORT || projectDevServerOptions.port || defaults.port;
      const port = await portfinder.getPortPromise();

      // Start watcher to reboot server
      const watcher = chokidar.watch(['server.config.js', ...(watch || [])]);

      // Start server
      server = await startServer({ api, host, port, args });

      // Restart server on changes
      watcher.on('all', async () => {
        consola.info('Changes detected: restarting server...');
        server = await reloadServer(server, { api, host, port, args });
      });

      // Restart on user input
      var stdin = process.openStdin();
      stdin.addListener('data', async d => {
        if (d.toString().trim() == 'rs') {
          consola.info('Restarting server...');
          server = await reloadServer(server, { api, host, port, args });
        }
      });

      const onCloseServer = () => {
        watcher.removeAllListeners();
        watcher.close();

        stdin.removeAllListeners();
        stdin.pause();

        process.stdin.destroy();
      };
      process.on('SIGINT', onCloseServer);
      process.on('SIGTERM', onCloseServer);
    },
  );
};

async function startServer({ api, host, port, args }) {
  const { Server } = require('@uvue/server');
  const getWebpackConfig = require('../webpack/ssr');
  const { https, devServer, spaPaths, renderer } = api.uvue.getServerConfig();

  const serverConfig = getWebpackConfig(api, { serve: true, client: false, host, port });
  const clientConfig = getWebpackConfig(api, { serve: true, client: true, host, port });

  if (ipc) {
    ipc.disconnect();
    ipc = null;
  }

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
    // Set files destinations
    paths: {
      serverBundle: '.uvue/server-bundle.json',
      clientManifest: '.uvue/client-manifest.json',
      templates: {
        spa: '.uvue/spa.html',
        ssr: '.uvue/ssr.html',
      },
    },

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

  reloading = false;

  if (reloadQueued) {
    consola.info(`Restart because a reload is queued...`);
    reloadQueued = false;
    return reloadServer(server, { api, host, port, args });
  }

  return server;
}
