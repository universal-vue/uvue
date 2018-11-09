<p align="center" style="text-align: center;">
  <img src="https://s3.eu-west-2.amazonaws.com/yabab/uvue-512.png" alt="UVue" width="256" height="256">
</p>

# UVue

> Build universal Vue applications with ease

- [Documentation](https://universal-vue.github.io/docs/)
- [CodeSandbox demo](https://codesandbox.io/s/github/universal-vue/uvue-codesandbox)

[![chat discord](https://img.shields.io/badge/chat-discord-blue.svg)](https://discord.gg/3ZZBmFs)
[![npm version](https://badge.fury.io/js/%40uvue%2Fvue-cli-plugin-ssr.svg)](https://badge.fury.io/js/%40uvue%2Fvue-cli-plugin-ssr)
[![TravisCI](https://travis-ci.org/universal-vue/uvue.svg?branch=master)](https://travis-ci.org/universal-vue/uvue)
[![CircleCI](https://circleci.com/gh/universal-vue/uvue/tree/master.svg?style=shield)](https://circleci.com/gh/universal-vue/uvue)
[![AppVeyor](https://ci.appveyor.com/api/projects/status/s152ysadin639ats?svg=true)](https://ci.appveyor.com/project/chymz/uvue)

## Getting started

**Install**

```bash
vue add @uvue/ssr
```

This plugins add commands to run or build your application in SSR mode:

**Start a development server with HMR**

```bash
npm run ssr:serve
```

**Build for production**

```bash
npm run ssr:build
```

**Start in production mode** (need a `npm run ssr:build` before)

```bash
npm run ssr:start
```

**Generate a static website**

```bash
npm run ssr:static
```

**Try to fix code to be SSR compatible**

```bash
npm run ssr:fix
```

## License

**MIT**: see LICENSE file
