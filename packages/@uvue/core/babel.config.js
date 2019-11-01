module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        exclude: ['@babel/transform-regenerator', '@babel/transform-async-to-generator'],
      },
    ],
  ],
  plugins: [
    'transform-async-to-promises',
    [
      '@babel/transform-runtime',
      {
        corejs: false,
        helpers: false,
      },
    ],
  ],
};
