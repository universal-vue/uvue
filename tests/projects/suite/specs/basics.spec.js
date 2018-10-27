import { basics, metas } from './tests';

describe('Basics', () => {
  basics
    .homeServer()
    .homeMount()
    .dataServer()
    .dataMount()
    .dataServer();

  metas
    .home()
    .data()
    .asyncData()
    .vuex();
});
