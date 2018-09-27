# Roadmap

## Alpha 0

- [x] Basic core package
- [x] Basic server package
  - [x] Plugins system
  - [x] Can send options to plugins from config
  - [x] Base plugins middlewares (static files, gzip, cookies)
- [x] CLI plugin
  - [x] Base commands works
  - [x] Command: serve
  - [x] Command: build
  - [x] Command: start
- [x] UVue API
  - [x] Attach to Vue CLI API
  - [x] Read configs files from current project
  - [x] Start Webpack plugin & loader to overwrite project code
- [x] Write basic tests
  - [x] Base project as a storybook
- [x] Contribute guide

## Alpha 1

- [x] **Core**: Implements `redirect()`
- [x] **Core plugins**: Plugins system with hooks
- [x] **Core plugins**: `asyncData()` on pages components
- [x] **Core plugins**: Vuex and `onHttpRequest` action
- [x] **Core plugins**: Middlewares system
- [x] **Core plugins**: Error handler (without Vuex)
- [x] **UVue API**: Transform main `new Vue` code to return only constructor options
- [x] **UVue API**: Load imports from project configuration
- [x] **UVue API**: Watch uvue config change to reload app
- [x] **Server**: Handle HTTPS configuration
- [x] **Server**: Handle correctly Vue meta plugin
- [x] **Server**: Docker start script
- [x] **Server**: Configure dev server
- [x] **Server**: Watch server config to reload server
- [ ] **Server**: Dockerfile
- [ ] **Server**: Docker Compose with Nginx
- [x] **DevTools**: Tools for CPU & RAM monitoring
- [x] **DevTools**: Benchmarks with scenario
- [x] **Webpack**: CSS management
- [x] **Killers features**: Critical CSS
- [x] **Killers features**: Modern build
- **Code Fixer**
  - [ ] Manage main.js
  - [ ] File finder
  - [ ] Manage base plugins: router & store
  - [ ] Manage side plugins: i18n, pwa, apollo
- [ ] **CLI plugin**: Base template (configs, router, server with plugins)
- [ ] **CLI plugin**: (Generator) manage main.js
- [ ] **CLI plugin**: (Generator) Detect Vue plugins presence and transform code
- [ ] **CLI plugin**: UI: Webpack dashboard & analyzer for `ssr:serve` and `ssr:build` commands
- [ ] **CLI plugin**: `generate` command
- [ ] **CLI plugin**: Docker: prompt & dockerfile
- [ ] **CLI plugin**: Prompts to install server plugins
- [ ] **CLI plugin**: Prompts to install UVue plugins
- [ ] **Vue CLI plugin support**: E2E tests with SSR mode
- [ ] **Vue CLI plugin support**: TypeScript
- [ ] **Vue CLI plugin support**: Vue i18n
- [ ] **Vue CLI plugin support**: Apollo
- [ ] **Common**: New logo
- [ ] **Common**: Documentation with Vuepress and custom theme
- [ ] **Common**: Issue template for Github
- [ ] **Common**: Better contribution guide
- [ ] **Common**: Example repository
- [x] **Common**: Discord Chat

## Next / Ideas / Future

- [ ] **Server**: Prod/Dev ready plugin
- [ ] **Server**: Pages cache plugin
  - [ ] Memory
  - [ ] Files
  - [ ] Redis
- [ ] **Server**: Server error plugin (to customize server error page)
- [ ] **Core Plugin**: Vue meta as plugin ?
- [ ] **Core Plugin**: SPA loader
- [ ] **Core Plugin**: Navigation loader
- [ ] **Core Plugin**: Stash
- [ ] **Vue CLI UI**: CPU & RAM monitoring for `ssr:start` command
- [ ] **Vue CLI UI**: Edit configuration files
- [ ] **Vue CLI UI**: `generate` command: List generated files & size
- [ ] **CSS**: Critters on each page
- [ ] **CSS**: Global Critters
- [ ] **CSS**: Critical auto generation
- [ ] **DevTools**: Better autocannon logs (status, low-high)
- [ ] **DevTools**: Benchmark heapdump
- [ ] **DevTools**: Scenario with auth

## Beta

- Tests
  - [ ] VueMeta plugin (e2e)
  - [ ] Redirects in plugins and navigation guards (e2e)
  - [ ] Error handler in plugins and navigation guards (e2e)
  - [ ] UVue plugins system (unit)
  - [ ] SPA paths (e2e)
  - [ ] Normal build in SPA mode (e2e)
  - [ ] devServer config correctly sent to middlewares (unit)
  - [ ] HTTPS setup on server (unit)
  - [ ] Docker start script (unit)
