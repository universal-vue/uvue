import consola from 'consola';
import execa from 'execa';
import { applyServerOptions, buildServerArgs } from './utils';

export default [
  yargs => {
    applyServerOptions(yargs);
    yargs.option('d', {
      alias: 'dev',
      describe: 'Run server in development mode',
      type: 'boolean',
    });
  },
  argv => {
    consola.start('Starting server with ndb...');

    let args = ['node', require.resolve('@uvue/server/start')];
    if (argv.dev) {
      args = ['node', require.resolve('@vue/cli-service/bin/vue-cli-service'), 'ssr:serve'];
    }

    const ndbPath = require.resolve('ndb/ndb');
    return execa(ndbPath, [...args, ...buildServerArgs(argv)]);
  },
];
