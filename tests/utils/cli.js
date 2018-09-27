import os from 'os';
import fs from 'fs';
import { execSync } from 'child_process';
import waitOn from 'wait-on';
import { argv as yargv } from 'yargs';
import execa from 'execa';
import { TestManager } from './TestManager';

const waitOnPromise = options => new Promise(resolve => waitOn(options, resolve));

const buildProject = async (tm, name) => {
  await tm.cliService(name, 'ssr:build');
};

const unitProject = async name => {
  // Unit/Integration tests
  await execa('./node_modules/.bin/jest', [], {
    stdio: 'inherit',
  });
};

const e2eProject = async (server, name) => {
  await waitOnPromise({
    resources: [`tcp:localhost:7357`],
    timeout: 60 * 1000,
  });

  const jest = execa(
    './node_modules/.bin/jest',
    ['--config', `tests/projects/${name}/jest.config.js`, '--verbose'],
    {
      stdio: 'inherit',
    },
  );

  jest.on('exit', exitCode => {
    if (server) {
      if (os.platform() === 'win32') {
        execSync(`taskkill /F /T /PID ${server.pid}`);
      } else {
        server.kill('SIGINT');
      }
    }

    console.log(`Exit code: ${exitCode}`);
    process.exit(exitCode);
  });
};

(async () => {
  const tm = new TestManager('packages/tests');
  const [command, name, arg0] = yargv._;

  if (!fs.existsSync('packages/tests/base/src/main.js')) {
    await tm.initBase();
  }

  if (!fs.existsSync(`packages/tests/${name}/src/main.js`)) {
    await tm.create(name);
  }

  switch (command) {
    /**
     * Install fixtures on project
     */
    case 'install:fixtures':
    case 'if':
      await tm.installFixtures(name, `tests/projects/${name}/fixtures`);
      break;

    /**
     * Invoke a Vue CLI plugin on project
     */
    case 'install:invoke':
    case 'ii':
      await tm.invoke(name, arg0);
      break;

    /**
     * Create a full test project
     */
    case 'install':
    case 'i':
      await tm.installFixtures(name, `tests/projects/${name}/fixtures`);
      await tm.invoke(name, arg0);
      break;

    /**
     * Run tests
     */
    case 'test:build':
      await buildProject(tm, name);
      break;

    case 'test:unit':
      await unitProject(name);
      break;

    case 'test:e2e':
      {
        const server = tm.cliService(name, 'ssr:start', ['--port', '7357']);
        await e2eProject(server, name);
      }
      break;

    case 'test':
    case 't':
      {
        // Build project
        await buildProject(tm, name);

        // Unit/Integration tests
        await unitProject(name);

        // E2E tests
        const server = tm.cliService(name, 'ssr:start', ['--port', '7357']);
        await e2eProject(server, name);
      }
      break;
  }
})().catch(err => console.error(err));
