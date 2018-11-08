import path from 'path';
import fs from 'fs-extra';
import autocannon from 'autocannon';
import yaml from 'js-yaml';
import waitOn from 'wait-on';
import opn from 'opn';
import consola from 'consola';
import { table } from 'table';
import chalk from 'chalk';

const waitOnPromise = options =>
  new Promise((resolve, reject) =>
    waitOn(options, err => {
      if (err) return reject(err);
      resolve();
    }),
  );

const tableStyles = {
  border: {
    topBody: `─`,
    topJoin: `┬`,
    topLeft: `┌`,
    topRight: `┐`,

    bottomBody: `─`,
    bottomJoin: `┴`,
    bottomLeft: `└`,
    bottomRight: `┘`,

    bodyLeft: `│`,
    bodyRight: `│`,
    bodyJoin: `│`,

    joinBody: `─`,
    joinLeft: `├`,
    joinRight: `┤`,
    joinJoin: `┼`,
  },
  columns: {
    0: {
      width: 15,
    },
    1: {
      width: 10,
    },
    2: {
      width: 10,
    },
    3: {
      width: 10,
    },
    4: {
      width: 10,
    },
    5: {
      width: 10,
    },
  },
  drawHorizontalLine: (index, size) => {
    return index === 0 || index === 1 || index === size;
  },
};

export const executeScenario = async (filepath, { host, port }) => {
  const data = await fs.readFile(path.resolve(filepath), 'utf-8');
  const scenario = yaml.load(data);

  host = host || 'localhost';
  port = port || 7357;

  const autocannonConfig = {
    url: `http://${host}:${port}`,
    connections: 10,
    duration: 5,
    ...(scenario.autocannon || {}),
  };

  consola.info('Waiting server is listening...');

  await waitOnPromise({
    resources: [`tcp:${host}:${port}`],
    timeout: 60 * 1000,
  });

  const httpBenchmark = (config, path = '/') => {
    consola.info(`Benchmarking: ${path}`);

    return new Promise((resolve, reject) => {
      autocannon(
        {
          ...config,
          url: `${config.url}${path}`,
        },
        (err, results) => {
          if (err) return reject(err);
          const { requests, latency } = results;

          const dataTable = [
            ['', chalk.blue('Min'), chalk.blue('Avg'), chalk.blue('Max')],
            [chalk.blue('Req/s'), requests.min, requests.average, requests.max],
            [chalk.blue('Latency(ms)'), latency.min, latency.average, latency.max],
          ];

          const statusTable = [
            [
              chalk.blue('Total'),
              chalk.blue('1xx'),
              chalk.green('2xx'),
              chalk.yellow('3xx'),
              chalk.red('4xx'),
              chalk.red('5xx'),
            ],
            [
              requests.total,
              results['1xx'],
              results['2xx'],
              results['3xx'],
              results['4xx'],
              results['5xx'],
            ],
          ];

          process.stdout.write(table(dataTable, tableStyles));
          process.stdout.write(table(statusTable, tableStyles));
          resolve(results);
        },
      );
    });
  };

  const wait = time => new Promise(resolve => setTimeout(resolve, time));

  if (!scenario.steps) {
    scenario.steps = [
      {
        path: '/',
      },
    ];
  }

  const repeat = scenario.repeat || 1;

  for (let i = 0; i < repeat; i++) {
    consola.start(`Run ${i + 1}/${repeat}`);

    for (const stepIndex in scenario.steps) {
      const step = scenario.steps[stepIndex];

      await httpBenchmark(autocannonConfig, step.path);

      if (step.wait) {
        await wait(step.wait);
      }
    }
  }
};

export const clinicRun = async (argv, clinicApi) => {
  const startPath = require.resolve('@uvue/server/start');

  await fs.ensureDir('.devtools');

  return new Promise((resolve, reject) => {
    clinicApi.collect(['node', startPath, ...buildServerArgs(argv)], (err, filepath) => {
      if (err) return reject(err);
      clinicApi.visualize(filepath, `${filepath}.html`, async err => {
        if (err) return reject(err);

        await fs.move(`./${filepath}`, `.devtools/${filepath}`);
        await fs.move(`./${filepath}.html`, `.devtools/${filepath}.html`);

        await opn(`.devtools/${filepath}.html`);
        resolve();
      });
    });

    if (argv.scenario) {
      executeScenario(argv.scenario, argv).then(() => {
        process.kill(process.pid, 'SIGINT');
      });
    }
  });
};

export const applyServerOptions = yargs => {
  yargs
    .option('h', {
      alias: 'host',
      default: process.env.HOST || 'localhost',
      describe: 'Set listen host',
      type: 'string',
    })
    .option('p', {
      alias: 'port',
      default: process.env.PORT || 7357,
      describe: 'Set listen port',
      type: 'number',
    });
};

export const buildServerArgs = argv => {
  return ['--host', argv.host, '--port', argv.port];
};
