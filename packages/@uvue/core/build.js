const rollup = require('rollup');
const babel = require('rollup-plugin-babel');

const libs = [
  // Core
  ['src/lib/index.js', 'lib/index.js'],
  ['src/client.js', 'lib/client.js'],
  ['src/server.js', 'lib/server.js'],
  // Plugins
  ['src/plugins/apollo.js', 'plugins/apollo.js'],
  ['src/plugins/asyncData.js', 'plugins/asyncData.js'],
  ['src/plugins/errorHandler.js', 'plugins/errorHandler.js'],
  ['src/plugins/middlewares.js', 'plugins/middlewares.js'],
  ['src/plugins/vuex.js', 'plugins/vuex.js'],
  ['src/plugins/prefetch/index.js', 'plugins/prefetch.js'],
];

(async () => {
  const builds = [];
  for (const lib of libs) {
    const [from, to] = lib;
    builds.push(buildLib(from, to));
  }

  await Promise.all(builds);
})();

async function buildLib(from, to) {
  const bundle = await rollup.rollup({
    input: from,
    plugins: [
      babel({
        runtimeHelpers: true,
        sourceMaps: true,
      }),
    ],
  });

  await bundle.write({
    file: to,
    format: 'esm',
    sourcemap: true,
  });
}
