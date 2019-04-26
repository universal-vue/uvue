#!/bin/env bash

# Core
rollup src/index.js --file dist/index.js --format esm -c
rollup src/client.js --file dist/client.js --format esm -c
rollup src/server.js --file dist/server.js --format esm -c

# Plugins
rollup src/plugins/apollo.js --file plugins/apollo.js --format esm -c
rollup src/plugins/asyncData.js --file plugins/asyncData.js --format esm -c
rollup src/plugins/errorHandler.js --file plugins/errorHandler.js --format esm -c
rollup src/plugins/middlewares.js --file plugins/middlewares.js --format esm -c
rollup src/plugins/vuex.js --file plugins/vuex.js --format esm -c
