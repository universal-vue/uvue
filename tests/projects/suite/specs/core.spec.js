import {
  pluginsInit,
  pluginsHooks,
  pluginsError,
  pluginsContext,
  pluginsErrorContext,
  redirect,
} from './tests';

describe('Core', () => {
  pluginsInit
    .server()
    .mount()
    .client();

  pluginsHooks
    .server()
    .mount()
    .client();

  pluginsContext
    .server()
    .mount()
    .client();

  pluginsError
    .server()
    .mount()
    .client();

  pluginsErrorContext
    .server()
    .mount()
    .client();

  redirect
    .server()
    .client()
    .helper();
});
