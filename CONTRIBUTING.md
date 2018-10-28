# Install project for development

This project uses a monorepo setup that requires using [Yarn](https://yarnpkg.com) because it relies on [Yarn workspaces](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/).

## Requirements

Node >= 8.10 || >= 10.6.0

## Clone and install dependencies

```bash
git clone git@gitlab.com:yabab/uvue.git
cd uvue
yarn install
```

Then you go to `packages/tests/suite` and start test project with the command:

```bash
yarn ssr:serve
```

## Packages in this repository

**@uvue/vue-cli-plugin-ssr**: Vue CLI plugin that changes default webpack configuration
to build SSR bundles. Add some prompts during install and some addons for Vue CLI UI.

**@uvue/core**: SSR logic for the Vue application, define and use plugins lifcyle methods
and have core plugins

**@uvue/server**: Package responsible of running a NodeJS server to render pages with
Vue SSR. It also define and use server plugins lifecycles.

**@uvue/rquery**: Simple lib to manipulate more easly AST (used in CLI plugin to fix
project code)

**@uvue/devtools**: Simple CLI to run some libraries: ndb, autocannon and node-clinic

## Linting and formatting

Theses libs are mandatory to lint and format your code:

- Prettier
- ESLint for JavaScript
- TSLint for TypeScript

## Run linters

In root folder:

```bash
yarn lint
```

## Run all tests

In root folder:

```bash
yarn test
```

## Run Unit tests

In root folder:

```bash
./tests/cli test:unit suite
```

## Run E2E tests

In root folder:

```bash
./tests/cli test:e2e suite
./tests/cli test:static suite
```
