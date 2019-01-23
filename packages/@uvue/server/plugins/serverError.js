import { join } from 'path';
import Youch from 'youch';
import merge from 'lodash/merge';

export default {
  install(_, options) {
    this.options = merge(
      {},
      {
        path: join(__dirname, '..', 'server-error.html'),
      },
      options || {},
    );
  },

  async beforeRender(context, server) {
    if (context.events) {
      context.events.once('error', async data => {
        if (data.error) {
          const body = await this.renderError(data.error, context.req);

          server.getAdapter().send(
            {
              body,
              status: 500,
            },
            context,
          );
        }
      });
    }
  },

  async routeError(err, response, { req }) {
    response.status = 500;
    response.body = await this.renderError(err, req);
  },

  async renderError(error, req) {
    if (process.env.NODE_ENV !== 'production') {
      const youch = new Youch(error, req);
      return youch.toHTML();
    } else {
      const { readFile } = require('fs-extra');
      return readFile(this.options.path, 'utf-8');
    }
  },
};
