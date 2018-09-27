import consola from 'consola';
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
    consola.start('Starting Node Clinic: Flame...');

    const ClinicFlame = require('@nearform/flame');
    const flame = new ClinicFlame();
    return clinicRun(argv, flame);
  },
];
