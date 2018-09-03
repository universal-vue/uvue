# Roadmap

## Alpha 0

- [x] Basic core package
- [x] Basic server package
- [x] CLI plugin
  - [x] Base commands works
  - [x] Command: serve
  - [x] Command: build
  - [x] Command: start
- [ ] UVue API
  - [ ] Attach to Vue CLI API
  - [ ] Read configs files from current project
- [ ] Write tests for server
- [ ] Write E2E tests for basic core
  - [ ] Base project as a storybook
- [x] Contribute guide

## Alpha 1

All tasks need to have a unit, intregration or e2e tests !

### Core

- [ ] Implements `asyncData()` on pages components
  - [ ] Handle hot reload
- [ ] Implements `redirect()`

### Core plugins

- [ ] Plugins system with hooks
- [ ] Vuex and `onHttpRequest` action
- [ ] Error handler (without Vuex)
- [ ] Middlewares system
  - [ ] Handle hot reload

### UVue API

- [ ] Transform main `new Vue` code to return only constructor options
- [ ] Load imports from project configuration
- [ ] Transorm Vue plugins instanciation with an export function (router, store)
  - [ ] Transform main.js to use these functions

### Server

- [ ] Handle HTTPS configuration
- [ ] Server plugins with hooks
- [ ] Handle correctly Vue meta plugin
- [ ] Tools for CPU & RAM monotirong
- [ ] Benchmarks
- [ ] Base plugins middlewares (static files, gzip, cookies)
- [ ] Docker start script

### CLI plugin

- [ ] Detect Vue plugins presence and transform code
- [ ] Base template if needed
- [ ] UI: Webpack dashboard & analyzer for `ssr:serve` and `ssr:build` commands
- [ ] `generate` command
- [ ] Docker: prompt & dockerfile

### Webpack

- [ ] CSS management

### Killers features

- [ ] Critical CSS
  - [ ] Critters
  - [ ] Critical / Penthous (Puppeteer based)
  - [ ] Vue components styles (@akryum repo)
- [ ] Modern build

### Common

- [ ] New logo
- [ ] Documentation with Vuepress with custom theme
- [ ] Issue template for Github
- [ ] Better contribution guide
- [ ] Example repository
- [ ] Discord Chat ?

## Alpha 2

### Vue CLI UI

- [ ] CPU & RAM monitoring for `start` command
- [ ] Edit configuration files
- [ ] `generate` command: List generated files & size

### Vue CLI plugin support

- [ ] E2E tests with SSR mode
- [ ] TypeScript
- [ ] Vue i18n
- [ ] Apollo

### Vue CLI generator

- [ ] Prompts to install core & server plugins

### Server plugins

- [ ] Pages cache plugin
- [ ] Server error plugin (to customize page)

## Core plugins

- [ ] SPA loader
- [ ] Navigation loader
