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
    [
      '@uvue/core/plugins/vuex',
      {
        fetch: true,
      },
    ],
    '@uvue/core/plugins/asyncData',
    '@uvue/core/plugins/errorHandler',
  ],
  css: {
    normal: 'inline',
    vue: 'inline',
  },
};
