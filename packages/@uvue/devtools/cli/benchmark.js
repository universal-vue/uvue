import execa from 'execa';
import { applyServerOptions, executeScenario, buildServerArgs } from './utils';

export default [
  yargs => {
    applyServerOptions(yargs);
    yargs.positional('scenario', {
      describe: 'Path of a scenario YAML file',
      type: 'string',
    });
  },
  async argv => {
    const startPath = require.resolve('@uvue/server/start');

    const server = execa('node', [startPath, ...buildServerArgs(argv)]);
    await executeScenario(argv.scenario, argv);
    server.kill('SIGINT');
  },
];
