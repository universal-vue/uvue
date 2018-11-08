const path = require('path');
const fs = require('fs-extra');
const { processStats } = require('@vue/cli-ui/ui-defaults/utils/stats');

module.exports = api => {
  api.addClientAddon({
    id: 'org.uvue.webpack.client-addon',
    // path: path.join(__dirname, 'ui-addon-dist'),
    url: 'http://localhost:8042/index.js',
  });

  const { getSharedData, setSharedData, removeSharedData } = api.namespace('org.vue.webpack.');

  let firstRun = true;
  let hadFailed = false;

  // Specific to each modes (serve, build, ...)
  const fields = {
    status: null,
    progress: {},
    operations: null,
    stats: null,
    sizes: null,
    problems: null,
    url: null,
  };

  // Common fields for all mode
  const commonFields = {
    'modern-mode': false,
  };

  // Init data
  api.onProjectOpen(setup);
  api.onPluginReload(setup);

  function setup() {
    for (const key of ['ssr-serve', 'ssr-build', 'ssr-build-modern']) {
      setupSharedData(key);
    }
    setupCommonData();
  }

  // Called when opening a project
  function setupSharedData(mode) {
    resetSharedData(mode);
  }

  // Called when opening a project
  function setupCommonData() {
    for (const field in commonFields) {
      setSharedData(field, getSharedDataInitialValue(field, commonFields[field]));
    }
  }

  function resetSharedData(mode, clear = false) {
    for (const field in fields) {
      const id = `${mode}-${field}`;
      setSharedData(id, getSharedDataInitialValue(id, fields[field], clear));
    }
  }

  function getSharedDataInitialValue(id, defaultValue, clear) {
    if (!clear) {
      const data = getSharedData(id);
      if (data != null) return data.value;
    }
    return defaultValue;
  }

  async function onWebpackMessage({ data: message }) {
    if (message.webpackDashboardData) {
      const modernMode = getSharedData('modern-mode').value;
      const type = message.webpackDashboardData.type;

      for (const data of message.webpackDashboardData.value) {
        const id = `${type}-${data.type}`;

        if (data.type === 'stats') {
          // Stats are read from a file
          const statsFile = path.resolve(api.getCwd(), `./node_modules/.stats-${type}.json`);
          const value = await fs.readJson(statsFile);
          const { stats, analyzer } = processStats(value);
          setSharedData(id, stats);
          setSharedData(`${id}-analyzer`, analyzer);
          await fs.remove(statsFile);
        } else if (data.type === 'progress') {
          if (type === 'serve' || !modernMode) {
            setSharedData(id, {
              [type]: data.value,
            });
          } else {
            // Display two progress bars
            const progress = getSharedData(id).value;
            progress[type] = data.value;
            for (const t of ['ssr-build', 'ssr-build-modern']) {
              setSharedData(`${t}-${data.type}`, {
                'ssr-build': progress['ssr-build'] || 0,
                'ssr-build-modern': progress['ssr-build-modern'] || 0,
              });
            }
          }
        } else {
          // Don't display success until both build and build-modern are done
          if (
            type !== 'ssr-serve' &&
            modernMode &&
            data.type === 'status' &&
            data.value === 'Success'
          ) {
            if (type === 'ssr-build-modern') {
              for (const t of ['ssr-build', 'ssr-build-modern']) {
                setSharedData(`${t}-status`, data.value);
              }
            }
          } else {
            setSharedData(id, data.value);
          }

          // Notifications
          if (type === 'ssr-serve' && data.type === 'status') {
            if (data.value === 'Failed') {
              api.notify({
                title: 'Build failed',
                message: 'The build has errors.',
                icon: 'error',
              });
              hadFailed = true;
            } else if (data.value === 'Success') {
              if (hadFailed) {
                api.notify({
                  title: 'Build fixed',
                  message: 'The build succeeded.',
                  icon: 'done',
                });
                hadFailed = false;
              } else if (firstRun) {
                api.notify({
                  title: 'App ready',
                  message: 'The build succeeded.',
                  icon: 'done',
                });
                firstRun = false;
              }
            }
          }
        }
      }
    }
  }

  // Tasks
  const views = {
    views: [
      {
        id: 'org.uvue.webpack.views.dashboard',
        label: 'Dashboard',
        icon: 'dashboard',
        component: 'org.uvue.webpack.components.dashboard',
      },
      {
        id: 'org.uvue.webpack.views.analyzer',
        label: 'Analyzer',
        icon: 'donut_large',
        component: 'org.uvue.webpack.components.analyzer',
      },
    ],
    defaultView: 'org.uvue.webpack.views.dashboard',
  };

  api.describeTask({
    match: /vue-cli-service ssr:serve/,
    description: 'SSR: Start development server with HMR',
    prompts: [
      {
        name: 'mode',
        type: 'list',
        default: 'development',
        choices: [
          {
            name: 'development',
            value: 'development',
          },
          {
            name: 'production',
            value: 'production',
          },
          {
            name: 'test',
            value: 'test',
          },
        ],
        description: 'Specify env',
      },
      {
        name: 'host',
        type: 'input',
        default: '127.0.0.1',
        description: 'Specify host',
      },
      {
        name: 'port',
        type: 'input',
        default: 8080,
        description: 'Specify port',
      },
    ],
    onBeforeRun: ({ answers, args }) => {
      // Args
      if (answers.mode) args.push('--mode', answers.mode);
      if (answers.host) args.push('--host', answers.host);
      if (answers.port) args.push('--port', answers.port);
      args.push('--dashboard');

      // Data
      resetSharedData('ssr-serve', true);
      firstRun = true;
      hadFailed = false;
    },
    onRun: () => {
      api.ipcOn(onWebpackMessage);
    },
    onExit: () => {
      api.ipcOff(onWebpackMessage);
      removeSharedData('serve-url');
    },
    ...views,
  });

  api.describeTask({
    match: /vue-cli-service ssr:build/,
    description: 'SSR: Make a production build',
    prompts: [
      {
        name: 'mode',
        type: 'list',
        default: 'production',
        choices: [
          {
            name: 'development',
            value: 'development',
          },
          {
            name: 'production',
            value: 'production',
          },
          {
            name: 'test',
            value: 'test',
          },
        ],
        description: 'Specify env',
      },
      {
        name: 'report',
        type: 'confirm',
        default: false,
        description: 'Generate report files',
      },
      {
        name: 'modern',
        type: 'confirm',
        default: false,
        message: 'org.vue.vue-webpack.tasks.build.modern.label',
        description: 'org.vue.vue-webpack.tasks.build.modern.description',
        link: 'https://cli.vuejs.org/guide/browser-compatibility.html#modern-mode',
      },
    ],
    onBeforeRun: ({ answers, args }) => {
      // Args
      if (answers.mode) args.push('--mode', answers.mode);
      if (answers.report) args.push('--report', answers.report);
      if (answers.mode) args.push('--modern', answers.modern);
      setSharedData('modern-mode', !!answers.modern);
      args.push('--dashboard');

      // Data
      resetSharedData('ssr-build', true);
    },
    onRun: () => {
      api.ipcOn(onWebpackMessage);
    },
    onExit: () => {
      api.ipcOff(onWebpackMessage);
    },
    ...views,
  });

  api.describeTask({
    match: /vue-cli-service ssr:start/,
    description: 'SSR: Start production server',
    prompts: [
      {
        name: 'mode',
        type: 'list',
        default: 'production',
        choices: [
          {
            name: 'development',
            value: 'development',
          },
          {
            name: 'production',
            value: 'production',
          },
          {
            name: 'test',
            value: 'test',
          },
        ],
        description: 'Specify env',
      },
      {
        name: 'host',
        type: 'input',
        default: '0.0.0.0',
        description: 'Specify host',
      },
      {
        name: 'port',
        type: 'input',
        default: 8080,
        description: 'Specify port',
      },
    ],
    onBeforeRun: ({ answers, args }) => {
      // Args
      if (answers.mode) args.push('--mode', answers.mode);
      if (answers.host) args.push('--host', answers.host);
      if (answers.port) args.push('--port', answers.port);
    },
  });

  api.describeTask({
    match: /vue-cli-service ssr:static/,
    description: 'Generate static website',
  });

  api.describeTask({
    match: /vue-cli-service ssr:fix/,
    description: 'Try to fix project code to be SSR compatible',
  });

  // Open app button
  api.ipcOn(({ data }) => {
    if (data.vueServe) {
      setSharedData('serve-url', data.vueServe.url);
    }
  });
};
