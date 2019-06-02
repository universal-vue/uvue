import { vuex, asyncData, middlewares, errorHandler } from './tests';

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
});
