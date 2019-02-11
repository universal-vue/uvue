import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import waitOn from 'wait-on';
import { argv as yargv } from 'yargs';
import execa from 'execa';
import { TestManager, uvueInvokePrompts } from './TestManager';

const waitOnPromise = options => new Promise(resolve => waitOn(options, resolve));
const wait = time => new Promise(resolve => setTimeout(resolve, time));

const buildProject = async (tm, name) => {
  await tm.cliService(name, 'ssr:build');
};

const unitProject = async name => {
  // Unit/Integration tests
  const args = ['--verbose'];
  if (os.platform() === 'win32') {
    args.push('--testPathIgnorePatterns', 'code-fixer');
  }

  await execa('./node_modules/.bin/jest', args, {
    stdio: 'inherit',
  });
};

const e2eProject = async (server, name, match = '**/suite/specs/*.spec.js') => {
  await waitOnPromise({
    resources: [`tcp:localhost:7357`],
    timeout: 60 * 1000,
  });

  await wait(1000);

  return new Promise((resolve, reject) => {
    const jest = execa(
      './node_modules/.bin/jest',
      ['--config', `tests/projects/${name}/jest.config.js`, '--verbose', '--testMatch', match],
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
      if (exitCode !== 0) {
        return reject(exitCode);
      }
      resolve();
    });
  });
};

(async () => {
  const tm = new TestManager('packages/tests');
  const [command, name, arg0] = yargv._;

  // Force Yarn
  const vuercPath = path.join(os.homedir(), '.vuerc');
  if (!fs.existsSync(vuercPath)) {
    await fs.writeFile(vuercPath, '{}');
  }
  await execa(require.resolve('@vue/cli/bin/vue.js'), ['config', '-s', 'packageManager', 'yarn']);

  if (!fs.existsSync('packages/tests/base/src/main.js')) {
    await tm.initBase();
  }

  if (!fs.existsSync(`packages/tests/${name}/src/main.js`)) {
    await tm.create(name);
  }

  switch (command) {
    /**
     * Create a full test project
     */
    case 'install':
    case 'i':
      await tm.installPlugins(name, `../projects/${name}/install.js`);
      await tm.invoke(name, '@uvue/vue-cli-plugin-ssr', uvueInvokePrompts);
      await tm.installFixtures(name, `tests/projects/${name}/fixtures`);
      break;

    /**
     * Run tests
     */
    case 'test:unit':
      await buildProject(tm, name);
      await unitProject(name);
      break;

    case 'test:e2e':
      try {
        let server = tm.cliService(name, 'ssr:start', ['--port', '7357']);
        await e2eProject(server, name);

        if (name === 'suite') {
          // SPA mode
          server = tm.cliService(name, 'serve', ['--port', '7357']);
          await e2eProject(server, name, '**/specs/spa/*.spec.js');
        }
      } catch (err) {
        if (typeof err === 'number') {
          process.exit(err);
        } else {
          process.exit(1);
        }
      }
      break;

    case 'test:static':
      {
        // Static generation
        await tm.cliService(name, 'ssr:static');

        const server = execa(
          path.resolve('node_modules', '.bin', 'serve'),
          ['-l', '7357', 'dist'],
          {
            cwd: path.join(tm.baseDir, name),
          },
        );
        await e2eProject(server, name, '**/specs/static/*.spec.js');
      }
      break;

    case 'test':
    case 't':
      try {
        // Build project
        await buildProject(tm, name);

        // Unit/Integration tests
        await unitProject(name);

        // E2E tests
        let server = tm.cliService(name, 'ssr:start', ['--port', '7357']);
        await e2eProject(server, name);

        if (name === 'suite') {
          // Static generation
          await tm.cliService(name, 'ssr:static', ['--noBuild']);

          server = execa(path.resolve('node_modules', '.bin', 'serve'), ['-l', '7357', 'dist'], {
            cwd: path.join(tm.baseDir, name),
          });
          await e2eProject(server, name, '**/specs/static/*.spec.js');

          // SPA mode
          server = tm.cliService(name, 'serve', ['--port', '7357']);
          await e2eProject(server, name, '**/specs/spa/*.spec.js');
        }
      } catch (err) {
        if (typeof err === 'number') {
          process.exit(err);
        } else {
          process.exit(1);
        }
      }
      break;
  }
})().catch(err => console.error(err));
