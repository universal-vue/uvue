import { join } from 'path';
import Youch from 'youch';
import { merge } from 'lodash-es';
import { logger } from '@uvue/server/lib/logger';

export default {
  install(server, options) {
    this.options = merge(
      {},
      {
        path: join(__dirname, '..', 'server-error.html'),
      },
      options || {},
    );
  },

  async routeError(err, response, { req }) {
    let html = '';

    logger.error(err);

    if (process.env.NODE_ENV !== 'production') {
      const youch = new Youch(err, req);
      html = await youch.toHTML();
    } else {
      const { readFile } = require('fs-extra');
      html = await readFile(this.options.path, 'utf-8');
    }

    response.status = 500;
    response.body = html;
  },
};
