const rollup = require('rollup');
const babel = require('rollup-plugin-babel');

const libs = [
  // Core
  ['src/lib/index.js', 'dist/index.js'],
  ['src/client.js', 'dist/client.js'],
  ['src/server.js', 'dist/server.js'],
  // Plugins
  ['src/plugins/apollo.js', 'plugins/apollo.js'],
  ['src/plugins/asyncData.js', 'plugins/asyncData.js'],
  ['src/plugins/errorHandler.js', 'plugins/errorHandler.js'],
  ['src/plugins/middlewares.js', 'plugins/middlewares.js'],
  ['src/plugins/vuex.js', 'plugins/vuex.js'],
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
