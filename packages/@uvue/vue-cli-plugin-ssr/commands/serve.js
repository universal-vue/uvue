const nodemon = require('nodemon');
const consola = require('consola');
const path = require("path")

const defaults = {
  host: 'localhost',
  port: 8080,
};

module.exports = api => {
  api.registerCommand(
    'ssr:serve',
    {
      description: 'start development server (SSR)',
      usage: 'vue-cli-service ssr:serve [options]',
      options: {
        '--mode': `specify env mode (default: development)`,
        '--host': `specify host (default: ${defaults.host})`,
        '--port': `specify port (default: ${defaults.port})`,
      },
    },
    async function() {
      const { watch, watchIgnore } = api.uvue.getServerConfig();

      nodemon({
        exec: `node ${path.resolve("./node_modules/@vue/cli-service/bin/vue-cli-service.js")} ssr:serve-run ${process.argv
          .slice(2)
          .map(arg => `"${arg}"`)
          .join(' ')}`,
        watch,
        ignore: watchIgnore,
      })
        .on('restart', () => {
          consola.info('Server restaring...');
        })
        .on('crash', () => {
          consola.error('Server crashed');
        });
    },
  );
};
