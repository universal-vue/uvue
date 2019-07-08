import { ExpressAdapter, ConnectAdapter, FastifyAdapter } from '@uvue/server';

export default {
  install(server, options) {
    const adapter = server.getAdapter();
    const app = server.getApp();

    if (adapter instanceof ExpressAdapter) {
      app.get('/adapter-route', (req, res) => {
        res.send({ adapter: 'express' });
      });
    } else if (adapter instanceof FastifyAdapter) {
      app.get('/adapter-route', (request, reply) => {
        reply.send({ adapter: 'fastify' });
      });
    } else if (adapter instanceof ConnectAdapter) {
      app.use((req, res, next) => {
        if (req.url.startsWith('/adapter-route')) {
          res.end('connect');
        } else {
          next();
        }
      });
    }
  },
};
