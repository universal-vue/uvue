# Install project for development

This project uses a monorepo setup that requires using [Yarn](https://yarnpkg.com) because it relies on [Yarn workspaces](https://yarnpkg.com/blog/2017/08/02/introducing-workspaces/).

## Requirements

Node @ \^6.14.0 || \^8.10.0 || >=9.10.0

## Clone and install dependencies

```bash
git clone git@gitlab.com:yabab/uvue.git
cd uvue
yarn install
```

## Create test project

These commands will create a base Vue CLI project, then it will be clone to multiple projects for
testing purposes.

```
./tests/cli install project
```

Then you can go to `packages/tests/project` to start the application with UVue plugin installed.

## Linting and formatting

Theses libs are mandatory to lint and format your code:

- Prettier
- ESLint for JavaScript
- TSLint for TypeScript

## Run units tests

@TODO

## Run E2E tests

@TODO
