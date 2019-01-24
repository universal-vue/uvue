import * as consola from 'consola';
import * as MFS from 'memory-fs';
import * as path from 'path';
import * as webpack from 'webpack';
import * as webpackDevMiddleware from 'webpack-dev-middleware';
import * as webpackHotMiddleware from 'webpack-hot-middleware';
import { IServer } from './interfaces';

export const setupDevMiddleware = async (
  app: IServer,
  callback: (...args: any[]) => void,
): Promise<any> => {
  const { client, server } = app.options.webpack;

  // Vue SSR
  let serverBundle;
  let clientManifest;

  // Ready vars
  let resolve;
  let resolved = false;

  const readyPromise = new Promise(r => {
    resolve = r;
  });

  const ready = (...args) => {
    if (!resolved) {
      resolve();
    }
    resolved = true;
    callback(...args);
  };

  // Instanciate virtual file system
  const mfs = new MFS();

  // Function to read in mfs
  const readFile = file => {
    try {
      return mfs.readFileSync(path.join(client.output.path, file), 'utf-8');
    } catch (err) {
      return 'null';
    }
  };

  if (app.getApp().__isKoa) {
    client.plugins = client.plugins.filter(
      item => !(item instanceof webpack.HotModuleReplacementPlugin),
    );
  }

  // Set simple filename for compiled files
  client.output.filename = '[name].js';

  // Create Webpack compiler
  const compiler = webpack([client, server]);
  compiler.outputFileSystem = mfs;

  if (app.getApp().__isKoa) {
    const koaWebpack = require('koa-webpack');

    const middleware = await koaWebpack({
      compiler: compiler.compilers[0],
      devMiddleware: {
        index: false,
        logLevel: 'silent',
        publicPath: client.output.publicPath,
        serverSideRender: true,
        stats: false,
        ...(app.options.devServer.middleware || {}),
      },
      hotClient: {
        logLevel: 'silent',
        ...(app.options.devServer.hot || {}),
      },
    });

    app.use(middleware);
  } else {
    // Add hot-middleware client
    client.entry.app.unshift('webpack-hot-middleware/client');

    // Install dev middlewares
    app.use(
      webpackDevMiddleware(compiler.compilers[0], {
        index: false,
        log: false,
        logLevel: 'silent',
        publicPath: client.output.publicPath,
        serverSideRender: true,
        stats: false,
        ...(app.options.devServer.middleware || {}),
      }),
    );

    app.use(
      webpackHotMiddleware(compiler.compilers[0], {
        log: false,
        logLevel: 'silent',
        ...(app.options.devServer.hot || {}),
      }),
    );
  }

  // When a compilation finished
  const handleCompilation = () => {
    const { uvueDir } = app.options;

    // Get templates
    const templates = {
      spa: readFile(path.join(uvueDir, 'spa.html')),
      ssr: readFile(path.join(uvueDir, 'ssr.html')),
    };

    // Get bundled files
    clientManifest = JSON.parse(readFile(path.join(uvueDir, 'client-manifest.json')));
    serverBundle = JSON.parse(readFile(path.join(uvueDir, 'server-bundle.json')));

    if (clientManifest && serverBundle) {
      ready(serverBundle, { clientManifest, templates });
    }
  };

  compiler.hooks.done.tap('WebapackClientDev', handleCompilation);
  compiler.compilers[1].watch({}, (err, stats) => {
    if (err) {
      throw err;
    }

    stats = stats.toJson();

    // tslint:disable-next-line
    stats.errors.forEach(err => consola.error(err));
    // tslint:disable-next-line
    stats.warnings.forEach(err => consola.warn(err));

    handleCompilation();
  });

  return readyPromise;
};
