export default {
  plugins: [
    ['@uvue/server/plugins/cookie', { secret: 'secret' }],
    ['@uvue/server/plugins/gzip'],
    ['@uvue/server/plugins/static'],
    ['@uvue/server/plugins/modernBuild'],
    // ['@uvue/server/plugins/cssPreload'],
  ],
  static: {
    params: {
      foo: ['bar'],
    },
  },
  spaPaths: ['/spa', '/spa/**'],
};
