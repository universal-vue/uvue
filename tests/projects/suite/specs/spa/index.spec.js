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

  middlewares.client();

  errorHandler.client().method();
});
