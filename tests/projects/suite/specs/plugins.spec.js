import { vuex, asyncData, middlewares, errorHandler, serverPrefetch } from './tests';

describe('Core plugins', () => {
  vuex
    .server()
    .mount()
    .client();

  asyncData
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

  serverPrefetch
    .server()
    .mount()
    .client();
});
