import {
  pluginsInstall,
  pluginsHooks,
  pluginsError,
  pluginsContext,
  pluginsErrorContext,
  redirect,
  redirectNavGuard,
  vuex,
  asyncData,
  middlewares,
  errorHandler,
} from '../tests';

describe('(SPA) Core', () => {
  pluginsInstall.client();

  pluginsHooks.client();

  pluginsError.client();

  pluginsContext.client();

  pluginsErrorContext.client();

  redirect.client().helper();
});

describe('(SPA) Core plugins', () => {
  vuex.client();

  asyncData.client();

  middlewares.client();

  errorHandler.client().method();
});
