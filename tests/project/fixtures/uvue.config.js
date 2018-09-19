import { global } from './src/shared/middlewares';

export default {
  plugins: [
    // Tests plugins
    ['@/plugins/hooks', { foo: 'bar' }],
    '@/plugins/redirect',
    '@/plugins/middleware',
    // Core plugins
    [
      '@uvue/core/plugins/middlewares',
      {
        middlewares: [global],
      },
    ],
    '@uvue/core/plugins/vuex',
    '@uvue/core/plugins/asyncData',
  ],
};
