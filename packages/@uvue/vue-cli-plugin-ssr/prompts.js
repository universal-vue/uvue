module.exports = [
  {
    name: 'uvuePlugins',
    type: 'checkbox',
    message: 'Install UVue plugins?',
    default: ['vuex', 'asyncData', 'errorHandler'],
    choices: [
      {
        name: 'Vuex',
        value: 'vuex',
      },
      {
        name: 'Async Data',
        value: 'asyncData',
      },
      {
        name: 'Error handler',
        value: 'errorHandler',
      },
      {
        name: 'Middlewares',
        value: 'middlewares',
      },
    ],
  },
  {
    name: 'vuexOptions',
    type: 'checkbox',
    message: 'Enable Vuex behaviors',
    when(input) {
      return input.uvuePlugins.indexOf('vuex') >= 0;
    },
    choices: [
      {
        name: 'Use fetch() methods on components',
        value: 'fetch',
      },
      {
        name: 'Use onHttpRequest() Vuex actions',
        value: 'onHttpRequest',
      },
    ],
  },
  {
    name: 'serverPlugins',
    type: 'checkbox',
    message: 'Install server plugins?',
    default: ['static', 'gzip', 'modernBuild'],
    choices: [
      {
        name: 'Static files serving',
        value: 'static',
      },
      {
        name: 'GZIP compression',
        value: 'gzip',
      },
      {
        name: 'Modern build',
        value: 'modernBuild',
      },
      {
        name: 'Cookie parser',
        value: 'cookie',
      },
    ],
  },
  {
    name: 'cookieSecret',
    type: 'input',
    message: 'Define a secret for your cookies',
    when(input) {
      return input.serverPlugins.indexOf('cookie') >= 0;
    },
  },
  {
    name: `docker`,
    type: `list`,
    message: `Do you want to use Docker to deploy your app?`,
    default: null,
    choices: [
      {
        name: 'No',
        value: null,
      },
      {
        name: 'Add production ready Dockerfile',
        value: 'dockerfile',
      },
      {
        name: 'Addd Dockerfile and docker-composer.yml to use with NGINX',
        value: 'docker-compose',
      },
    ],
  },
];
