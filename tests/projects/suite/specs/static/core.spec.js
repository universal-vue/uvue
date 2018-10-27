import {
  pluginsHooks,
  pluginsInstall,
  pluginsError,
  pluginsContext,
  pluginsErrorContext,
  redirect,
} from '../tests';

describe('Core', () => {
  pluginsInstall
    .server()
    .mount()
    .client();

  pluginsHooks
    .server()
    // .mount()
    .client();

  pluginsError
    .server()
    // .mount()
    .client();

  pluginsContext
    // .server()
    .mount()
    .client();

  pluginsErrorContext
    // .server()
    .mount()
    .client();

  redirect.client().helper();
});
