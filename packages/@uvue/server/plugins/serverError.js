import { join } from 'path';
import { readFile } from 'fs-extra';
import Youch from 'youch';
import youchTerminal from 'youch-terminal';
import { merge } from 'lodash';

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

    if (process.env.NODE_ENV !== 'production') {
      const youch = new Youch(err, req);
      html = await youch.toHTML();

      const json = await youch.toJSON();
      // tslint:disable-next-line
      console.error(youchTerminal(json));
    } else {
      html = await readFile(this.options.path, 'utf-8');
    }

    response.status = 500;
    response.body = html;
  },
};
