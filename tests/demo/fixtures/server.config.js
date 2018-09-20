export default {
  plugins: [
    [
      '@uvue/server/plugins/static',
      {
        directory: 'dist',
      },
    ],
  ],
};
