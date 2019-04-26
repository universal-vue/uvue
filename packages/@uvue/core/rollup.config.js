import babel from 'rollup-plugin-babel';
import minify from 'rollup-plugin-babel-minify';

export default {
  plugins: [
    babel({
      runtimeHelpers: true,
    }),
    // minify({
    //   comments: false,
    //   sourceMap: false,
    // }),
  ],
};
