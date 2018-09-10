# Server plugins

You can control some server behaviors with plugins: add server middlewares, act on on
route rendering or before response is sent.

## Install plugin

You can add plugins to server in the `server.config.js` file in your app project:

```js
export default {
  plugins: [
    // Just add a plugin with its path
    '@uvue/server/plugins/gzip',

    // Add a plugin and define some options
    ['@uvue/server/plugins/gzip', { some: 'option' }],
  ],
};
```

As you can see, you need to define just the path of a Javascript file, or an array with
2 entries: first is the path of your plugin, second will be options sent to plugin.

## Basic plugins

Some plugins are available to start a production ready server with UVue

### Cookie

Useful if your app have or need an authentication system. It will simply parse cookies
from all HTTP requests and made them available in your application. Cookies are a good
system to share auth tokens between your server side and client side.

```js
export default {
  plugins: [
    [
      '@uvue/server/plugins/cookie',
      {
        secret: '',
        options: {},
      },
    ],
  ],
};
```

- **secret**: a string or array used for signing cookies. This is optional and if not
  specified, will not parse signed cookies. If a string is provided, this is used as the
  secret. If an array is provided, an attempt will be made to unsign the cookie with
  each secret in order.
- **options**: an object that is passed to cookie.parse as the second option.
  See [cookie](https://www.npmjs.com/package/cookie) for more information

More information here: [https://github.com/expressjs/cookie-parser](https://github.com/expressjs/cookie-parser)

### GZIP compression

Can apply a GZIP compression on your files. Useful with you want to save bandwith
in production mode.

```js
export default {
  plugins: [
    [
      '@uvue/server/plugins/gzip',
      {
        filter: null,
        level: -1,
        //...
      },
    ],
  ],
};
```

More informations here: [https://www.npmjs.com/package/compression](https://www.npmjs.com/package/compression)

### Serve static files

This plugin is required for your application to work properly: its purpose is to
serve static files (js, css, images...) bundled or not by Webpack.

```js
export default {
  plugins: [
    [
      '@uvue/server/plugins/static',
      {
        acceptRanges: null,
        index: false,
        //...
      },
    ],
  ],
};
```

More informations here: [https://www.npmjs.com/package/serve-static](https://www.npmjs.com/package/serve-static)

## Plugin development

A plugin is just an object with defined methods to act on different hooks:

```js
export default {
  // Act on server bootstrap: good place to define some server middlewares
  async beforeStart(app) {
    app.use('/path', myMiddleware(this.$options));
  },

  // Do an action before page will be rendered by Vue SSR
  async beforeRender(context, app) {
    // ...
  },

  // Body is rendered, now building the entire HTML page
  async beforeBuild(response, context, app) {
    // ...
  },

  // HTML is ready to be sent to client
  async rendered(response, context, app) {
    // You can alter response conten before sending it
  },

  // Act when something go wrong during SSR rendering
  async routeError(error, response, context, app) {
    // Good place to render an error page
  },

  // Page was sent to client
  async afterResponse(context, app) {
    // Good place to log things
  },
};
```

You can access to options defined options in `server.config.js` via `this.$options`
variable in any methods.
