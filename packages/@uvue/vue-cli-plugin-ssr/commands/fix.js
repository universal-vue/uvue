const path = require('path');
const CodeFixer = require('../uvue/CodeFixer');
const ApiUtil = require('../ApiUtil');


module.exports = api => {
  api.registerCommand(
    'ssr:fix',
    {
      description: 'try to fix project code to be SSR compatible',
      usage: 'vue-cli-service ssr:fix',
    },
    async function() {
      const cf = new CodeFixer(path.join(new ApiUtil(api).getProjectPath(), 'src'));
      await cf.run(api, new ApiUtil(api).getMainPath());
    },
  );
};
