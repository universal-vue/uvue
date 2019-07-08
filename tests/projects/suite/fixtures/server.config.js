import * as fs from 'fs';
import { ExpressAdapter, FastifyAdapter, KoaAdapter } from '@uvue/server';

export default {
  // adapter: FastifyAdapter,
  // http2: true
  // https: {
  //   key: fs.readFileSync('ssl.key'),
  //   cert: fs.readFileSync('ssl.cert'),
  // },

  logger: {
    level: 'silent',
  },

  plugins: [
    ['@uvue/server/plugins/cookie', { secret: 'secret' }],
    ['@uvue/server/plugins/gzip'],
    ['@uvue/server/plugins/static'],
    ['@uvue/server/plugins/modernBuild'],
    ['@uvue/server/plugins/serverError'],
    ['./serverPlugin'],
  ],
  static: {
    params: {
      foo: ['bar'],
    },
  },
  spaPaths: ['/spa', '/spa/**'],
};
