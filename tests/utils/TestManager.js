import fs from 'fs-extra';
import path from 'path';
import execa from 'execa';
import vueCreate from '@vue/cli-test-utils/createTestProject';
import deepMerge from 'deepmerge';

const uvuePlugins = ['vuex', 'asyncData', 'errorHandler', 'middlewares'];
const vuexOptions = ['fetch', 'onHttpRequest'];
const serverPlugins = ['static', 'gzip', 'modernBuild', 'cookie'];

export const uvueInvokePrompts = [
  ...uvuePlugins.reduce((results, item) => {
    results.push('--uvuePlugins', item);
    return results;
  }, []),
  ...vuexOptions.reduce((results, item) => {
    results.push('--vuexOptions', item);
    return results;
  }, []),
  ...serverPlugins.reduce((results, item) => {
    results.push('--serverPlugins', item);
    return results;
  }, []),
  '--cookieSecret',
  'secret',
];

export class TestManager {
  constructor(baseDir = process.cwd()) {
    this.baseDir = baseDir;
    this.baseProjectPath = path.join(this.baseDir, 'base');
  }

  /**
   * Create a base project with vue create
   */
  async initBase() {
    // Clean base project
    await fs.remove(this.baseProjectPath);

    // Base preset for tests
    const preset = {
      router: true,
      routerHistoryMode: true,
      vuex: true,
      plugins: {
        '@vue/cli-plugin-babel': {},
      },
    };

    // Check tests path exists
    await fs.ensureDir(this.baseDir);

    // Vue create command
    await vueCreate('base', preset, this.baseDir);

    // Add some dependencies
    await execa('yarn', ['add', 'vue-meta'], {
      cwd: this.baseProjectPath,
      stdio: 'inherit',
    });

    // Setup symlink
    await this.updatePackage('base', {
      devDependencies: {
        '@uvue/vue-cli-plugin-ssr': 'link:../../@uvue/vue-cli-plugin-ssr',
      },
    });
  }

  /**
   * Simply override package.json
   */
  async updatePackage(name, data) {
    const packagePath = path.join(this.baseDir, name, 'package.json');
    let packageData = JSON.parse(await fs.readFile(packagePath));

    // Override package.json
    packageData = deepMerge(packageData, data);

    // Update package.json
    await fs.writeFile(packagePath, JSON.stringify(packageData, null, 2));
  }

  /**
   * Create a clone of base project
   */
  async create(name) {
    const projectPath = path.join(this.baseDir, name);

    // Clean old project
    await fs.remove(projectPath);

    // Clone base project
    await fs.copy(this.baseProjectPath, projectPath);

    // Change package name
    await this.updatePackage(name, {
      name,
    });
  }

  /**
   * Add a Vue CLI plugin
   */
  async add(name, plugin = '@uvue/vue-cli-plugin-ssr', invokePrompts = []) {
    const projectPath = path.join(this.baseDir, name);

    // Vue invoke command
    await execa(require.resolve('@vue/cli/bin/vue'), ['add', plugin, ...invokePrompts], {
      cwd: projectPath,
      stdio: 'inherit',
    });
  }

  /**
   * Invoke a plugin generator
   */
  async invoke(name, plugin = '@uvue/vue-cli-plugin-ssr', invokePrompts = []) {
    const projectPath = path.join(this.baseDir, name);

    // Vue invoke command
    await execa(require.resolve('@vue/cli/bin/vue'), ['invoke', plugin, ...invokePrompts], {
      cwd: projectPath,
      stdio: 'inherit',
    });

    // Setup symlinks
    await this.updatePackage(name, {
      dependencies: {
        '@uvue/server': 'link:../../@uvue/server',
        '@uvue/core': 'link:../../@uvue/core',
      },
      scripts: {
        devtools: 'uvue-devtools',
        start: 'uvue-start',
      },
    });
  }

  /**
   * Install plugins on project
   */
  async installPlugins(name, installPath) {
    if (await fs.exists(path.join(__dirname, installPath))) {
      const deps = require(installPath)(this);
      if (deps.plugins) {
        for (const pluginName in deps.plugins) {
          await this.add(name, pluginName, deps.plugins[pluginName]);
        }
      }
    }
  }

  /**
   * Install fixtures on project
   */
  async installFixtures(name, fixturesPath) {
    if (await fs.exists(fixturesPath)) {
      await fs.copy(fixturesPath, path.join(this.baseDir, name));
    }
  }

  /**
   * Call a script on project
   */
  cliService(name, command, args = []) {
    const projectPath = path.join(this.baseDir, name);
    return execa('./node_modules/.bin/vue-cli-service', [command, ...args], {
      cwd: projectPath,
      stdio: 'inherit',
    });
  }
}
