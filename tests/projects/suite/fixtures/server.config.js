import { ExpressAdapter } from '@uvue/server';
import { FastifyAdapter } from '@uvue/server';
import { KoaAdapter } from '@uvue/server';

export default {
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
