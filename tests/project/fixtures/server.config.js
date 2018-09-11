export default {
  plugins: [
    // Cookie parser
    // https://www.npmjs.com/package/cookie-parser
    ['@uvue/server/plugins/cookie', { secret: 'cookie secret' }],
    // GZIP compression
    // See: https://www.npmjs.com/package/compression
    ['@uvue/server/plugins/gzip'],
    // Serve static files
    // https://www.npmjs.com/package/serve-static
    [
      '@uvue/server/plugins/static',
      {
        directory: 'dist',
        options: {
          /* see middleware options */
        },
      },
    ],
  ],
};
