import yargs from 'yargs';

// prettier-ignore
yargs
  .usage('$0 <cmd> [args]')
  .help()
  // Node Clinic commands
  .command('doctor', 'Start a node Clinic Doctor against server', ...require('./doctor').default)
  .command('flame', 'Start a node Clinic Flame against server', ...require('./flame').default)
  .command(
    'bubbleprof',
    'Start a node Clinic BubbleProf against server',
    ...require('./bubbleprof').default,
  )
  // ndb
  .command('ndb', 'Start server with ndb', ...require('./ndb').default)
  // Benchmark
  .command('benchmark <scenario>', 'Run a benchmark scenario', ...require('./benchmark').default)
  // Clean
  .command('clean', 'Clean node clinic reports', ...require('./clean').default)
  .argv;
