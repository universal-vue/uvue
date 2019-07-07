import { vuex, asyncData, middlewares, errorHandler, serverPrefetch, prefetch } from './tests';

describe('Core plugins', () => {
  vuex
    .server()
    .mount()
    .client();

  asyncData
    .server()
    .mount()
    .client();

  serverPrefetch
    .server()
    .mount()
    .client();

  prefetch
    .server()
    .mount()
    .client();

  middlewares
    .server()
    .mount()
    .client();

  errorHandler
    .server()
    .mount()
    .client()
    .method();
});
