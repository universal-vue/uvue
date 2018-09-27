export default {
  plugins: [
    '@uvue/server/plugins/modernBuild',
    '@uvue/server/plugins/cookie',
    '@uvue/server/plugins/gzip',
    [
      '@uvue/server/plugins/static',
      {
        directory: 'dist',
      },
    ],
  ],
};
