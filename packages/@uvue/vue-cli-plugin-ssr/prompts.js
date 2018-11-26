module.exports = [
  {
    name: 'uvuePlugins',
    type: 'checkbox',
    message: 'Install UVue plugins?',
    default: ['vuex', 'asyncData', 'errorHandler', 'middlewares'],
    choices: [
      {
        name: 'Async Data method',
        value: 'asyncData',
      },
      {
        name: 'Vuex',
        value: 'vuex',
      },
      {
        name: 'Middlewares system',
        value: 'middlewares',
      },
      {
        name: 'Error handler',
        value: 'errorHandler',
      },
    ],
  },
  {
    name: 'vuexOptions',
    type: 'checkbox',
    message: 'Enable Vuex behaviors',
    default: ['onHttpRequest'],
    when(input) {
      return input.uvuePlugins.indexOf('vuex') >= 0;
    },
    choices: [
      {
        name: 'Use onHttpRequest() Vuex actions',
        value: 'onHttpRequest',
      },
      {
        name: 'Use fetch() methods on components',
        value: 'fetch',
      },
    ],
  },
  {
    name: 'serverPlugins',
    type: 'checkbox',
    message: 'Install server plugins?',
    default: ['serverError', 'static', 'gzip', 'modernBuild'],
    choices: [
      {
        name: 'Server error page',
        value: 'serverError',
      },
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
        name: 'Add a production ready Dockerfile',
        value: 'dockerfile',
      },
      {
        name: 'Add a Dockerfile and docker-compose.yml (with NGINX)',
        value: 'docker-compose',
      },
    ],
  },
];
