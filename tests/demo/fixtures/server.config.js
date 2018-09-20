export default {
  plugins: [
    '@uvue/server/plugins/gzip',
    '@uvue/server/plugins/modernBuild',
    [
      '@uvue/server/plugins/static',
      {
        directory: 'dist',
      },
    ],
  ],
};
