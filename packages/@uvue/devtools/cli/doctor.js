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
    const ClinicDoctor = require('@nearform/doctor');
    const doctor = new ClinicDoctor();
    return clinicRun(argv, doctor);
  },
];
