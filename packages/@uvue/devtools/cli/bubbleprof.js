import { applyServerOptions, clinicRun } from './utils';

export default [
  yargs => {
    applyServerOptions(yargs);
    yargs.option('s', {
      alias: 'scenario',
      describe: 'Path to a scenario file',
      type: 'string',
    });
  },
  argv => {
    const ClinicBubbleprof = require('@nearform/bubbleprof');
    const bubbleprof = new ClinicBubbleprof();
    return clinicRun(argv, bubbleprof);
  },
];
