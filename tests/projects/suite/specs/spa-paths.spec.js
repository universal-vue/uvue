import {
  pluginsInit,
  pluginsHooks,
  pluginsError,
  pluginsContext,
  redirect,
  vuex,
  asyncData,
  middlewares,
  errorHandler,
  serverPrefetch,
  prefetch,
} from './tests';

describe('SPA paths', () => {
  pluginsInit.client();

  pluginsHooks.client();

  pluginsError.client();

  pluginsContext.client();

  redirect.client().helper();

  vuex.client();

  asyncData.client();

  serverPrefetch.client();

  prefetch.client();

  middlewares.client();

  errorHandler.client().method();
});
