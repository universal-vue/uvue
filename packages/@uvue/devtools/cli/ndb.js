import consola from 'consola';
import execa from 'execa';
import { applyServerOptions, buildServerArgs } from './utils';

export default [
  yargs => {
    applyServerOptions(yargs);
    yargs.option('prod', {
      describe: 'Run server in production mode',
      type: 'boolean',
    });
  },
  argv => {
    consola.start('Starting server with ndb...');

    let args = ['node', require.resolve('@vue/cli-service/bin/vue-cli-service'), 'ssr:serve'];
    if (argv.prod) {
      args = ['node', require.resolve('@uvue/server/start')];
    }

    const ndbPath = require.resolve('ndb/ndb');
    return execa(ndbPath, [...args, ...buildServerArgs(argv)]);
  },
];
