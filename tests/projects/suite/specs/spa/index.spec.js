import {
  pluginsInit,
  pluginsHooks,
  pluginsError,
  pluginsContext,
  pluginsErrorContext,
  redirect,
  vuex,
  asyncData,
  middlewares,
  errorHandler,
  serverPrefetch,
  prefetch,
} from '../tests';

describe('(SPA) Core', () => {
  pluginsInit.client();

  pluginsHooks.client();

  pluginsError.client();

  pluginsContext.client();

  pluginsErrorContext.client();

  redirect.client().helper();
});

describe('(SPA) Core plugins', () => {
  vuex.client();

  asyncData.client();

  serverPrefetch.client();

  prefetch.client();

  middlewares.client();

  errorHandler.client().method();
});
