const path = require('path');
const CodeFixer = require('../uvue/CodeFixer');

module.exports = api => {
  api.registerCommand(
    'ssr:fix',
    {
      description: 'try to fix project code to be SSR compatible',
      usage: 'vue-cli-service ssr:fix',
    },
    async function() {
      const cf = new CodeFixer(path.join(api.uvue.getProjectPath(), 'src'));
      await cf.run(api, api.uvue.getMainPath());
    },
  );
};
