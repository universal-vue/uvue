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
- [x] **Server**: Dockerfile
- [x] **Server**: Docker Compose with Nginx
- [x] **DevTools**: Tools for CPU & RAM monitoring
- [x] **DevTools**: Benchmarks with scenario
- [x] **Webpack**: CSS management
- [x] **Killers features**: Critical CSS
- [x] **Killers features**: Modern build
- **Code Fixer**
  - [x] Manage main.js
  - [x] File finder
  - [x] Manage base plugins: router & store
  - [x] Manage side plugins: i18n, pwa
- [x] **CLI plugin**: Base template (configs, router, server with plugins)
- [x] **CLI plugin**: (Generator) manage main.js
- [x] **CLI plugin**: (Generator) Detect Vue plugins presence and transform code
- [x] **CLI plugin**: UI: Webpack dashboard & analyzer for `ssr:serve` and `ssr:build` commands
- [x] **CLI plugin**: `ssr:static` command
- [x] **CLI plugin**: Docker prompt
- [x] **CLI plugin**: Prompts to install server plugins
- [x] **CLI plugin**: Prompts to install UVue plugins
- [x] **Vue CLI plugin support**: TypeScript
  - [x] Types for process & class components
- [x] **Vue CLI plugin support**: Vue i18n
- [x] **Vue CLI plugin support**: PWA
- [x] **Vue CLI plugin support**: Apollo
- [x] **CLI plugin**: `ssr:static` manage `res.finished`
- [x] **Common**: New logo
- [ ] **Common**: Documentation with Vuepress and custom theme
- [ ] **Common**: Issue template for Github
- [x] **Common**: Better contribution guide
- [ ] **Common**: Example repository
- [ ] **Common**: CodeSandbox template
- [x] **Common**: Discord Chat

## Next

- [ ] **Server**: Server error plugin (to customize server error page)
- [ ] **DevTools**: Better autocannon logs (status, low-high)
- [ ] **Docker** With varnish cache
- **Server**: Pages cache plugin
  - [ ] Memory
  - [ ] Files
  - [ ] Redis

# Ideas / Future

- **Server**: Adapters
  - [ ] Express
  - [ ] Koa
- [ ] **Vue CLI UI**: `ssr:static` Generate a files wil all redirects
- [ ] **Plugin**: Available .env variables in configs files
- [ ] **Vue CLI UI**: CPU & RAM monitoring for `ssr:start` command
- [ ] **Vue CLI UI**: Edit configuration files
- [ ] **Vue CLI UI**: `ssr:static` command: List generated files & size
- [ ] **Vue CLI plugin support**: E2E tests in SSR mode
- [ ] **CSS**: Critters on each page
- [ ] **CSS**: Global Critters
- [ ] **CSS**: Critical auto generation
- [ ] **DevTools**: Benchmark heapdump
- [ ] **DevTools**: Scenario with auth

## Beta

- Tests
  - [x] SPA paths (e2e)
  - [x] Normal build in SPA mode (e2e)
  - [x] VueMeta plugin (e2e)
  - [ ] UVue plugins system
  - [ ] devServer config correctly sent to middlewares
  - [ ] HTTPS setup on server
  - [ ] Docker start script
