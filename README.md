# UVue Next

**Welcome to the next version of UVue with Vue 3!**

Here you can find a minimal documentation to start with UVue and Vue 3 to build powerful SSR application. This new version is totally rewrited from scratch, in TypeScript and fully embrace the new composition API. Consider this as a work in progress, there is still a lot missing work, features and tests to be done.

At this point everything can still change and that's why the new UVue code source is closed. I'm waiting to have a more mature features and a well-tested code source to open it.

Anyway you can start playing with it through the starter template or see what features are available with the demo repository. Actually this preview is not a Vue CLI plugin, but use internal Vue CLI configuration to work, so you can install others plugins (but some of them are not Vue 3 ready)

## Table of contents

- [Quick start](#Quick-start)
- [Features](#Features)
  - [usePrefetch](#usePrefetch)
  - [routeData](#routeData)
  - [Middlewares](#Middlewares)
- [How to](#How-to)
  - [Create a plugin](#Create-a-plugin)
  - [Use Axios](#Use-Axios)
  - [Have a store](#Use-Pinia-as-global-store)
  - [Create a server plugin](#Create-a-server-plugin)
  - [Create a bundle](#Create-a-bundle)
  - [Have a runtime config](#Have-a-runtime-config)
  - [Define 404 not found page](#Define-404-not-found-page)
- [Roadmap](#Roadmap)

## Quick start

### Starter template

> [Go to repository](https://github.com/universal-vue/starter)

You'll find in this repository only a starting project, with some basic configuration but without an actual application source code.\
Included in it:

- TypeScript
- ESlint + Prettier
- Vue Router

### Demo

> [Go to repository](https://github.com/universal-vue/demo)

This repository include a fully working application which use all core features plus some plugins:

- TypeScript
- ESlint + Prettier
- Vue Router
- TailwindCSS
- Axios to do AJAX calls
- Pinia as global store
- Global state with a reactive object
- Vue Head for metas management
- Runtime config bundle

## Features

### usePrefetch

This feature is the same as `prefetch()` hook on previous version of UVue. 

It can be called by any component. On server-side the async callback defined in the `usePrefetch()` function will be executed. When the client side will mount your application, this function will not be called anaymore: UVue will try to use the data fetched during the server rendering phase.

Here is an example:

```html
<template>
  <div>
    <template v-if="loading">
      Loading...
    </template>

    <template v-else-if="error">
      An error as ouccred
    </template>

    <template v-else>
      {{ data }}
    </template>

    <button @click="fetch">
      Refresh
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { usePrefetch } from '@uvue/core';

export default defineComponent({
  setup() {
    const axios = useAxios();
  
    // All theses variables are Refs, except fetch which is a function
    const { data, error, loading, fetch } = usePrefetch(async () => {
      // Do AJAX call here
      const { data } = await axios.get('https://example.com');
      // Do extra processing here...
      return data;
    });

    return {
      data,
      error,
      loading,
      fetch,
    };
  }
});
</script>
```

> You can see a setup with axios in [Use Axios](#Use-Axios)

### routeData

This component hook try to have the same behaviour as `asyncData` on previous version of UVue.

This method are only called on component that are views (defined as a route in Vue Router). You have access to the UVue context and you can do any async operations you want in it, to inject data fetched in your component, you have to use `useRouteData()` in your setup function.

> This feature is an UVue plugin, so you can disable it if you don't need it.

Example:

```ts
import { defineComponent } from 'vue';
import { Context } from '@uvue/core';
import { useRouteData } from '@uvue/plugins/routeData';

export default defineComponent({
  async routeData({ $axios }: Context) {
    // Do AJAX call here
    const { data } = await $axios.get('https://example.com');
      // Do extra processing here...
    return data;
  },

  setup() {
    // data is a Ref
    const data = useRouteData();

    // Send data to template
    return {
      data
    };
  },
})
```

### Middlewares

Same as middlewares on previous version of UVue.

Middlewares are useful if you want to do some checks before a route is resolved. In most cases, it's used to check is user is logged and if not, redirect it to login page.

> This feature is an UVue plugin, so you can disable it if you don't need it.

A middleware is a function which accept one argument: the UVue context.

```ts
import { Context } from '@uvue/core';

function isAuthenticated({ req, redirect }: Context) {
  // User is not logged
  if (!req.user) {
    // Redirect him to login page!
    redirect('/login');
  }
}
```

Then you can add this middleware on your routes:

```ts
{
  path: '/profile',
  component: UserProfile,
  meta: {
    // Multiple middlewares can be defined
    middlewares: [isAuthenticated]
  }
}
```

## How to

### Create a plugin

To [avoid stateful singletons](https://ssr.vuejs.org/guide/structure.html#avoid-stateful-singletons) or include some librariries only on client side, you'll need to create a plugin. Plugins will be instanciated on each requests and just after the Vue app has been created.

Basic code:

```ts
import { 
  definePlugin, 
  Context, 
  PluginInject, 
  onPluginsInstalled, 
  onRouterReady, 
  onAppMounted
} from '@uvue/core';

export default definePlugin(async (context: Context, inject: PluginInject, opions?: any) => {
  // Here Vue app is created

  // Install a Vue plugin
  app.use(someVuePlugin);

  // Provide service/data to your app
  app.provide('foo', 'bar');

  // Inject service/data to context and `this`
  inject('foo', 'bar');
  // In context: `context.$foo`
  // In components: `this.$foo`

  // When all plugins are installed and ready
  onPluginsInstalled(async (context: Context) => {
    // You can call injected stuff from other plugins here
  });

  // When first route is resolved and router is ready
  onRouterReady(async (context: Context) => {
    // You can access to router `currentRoute`
  });

  // When app is mounted
  onAppMounted(async (context: Context) => {
    // Executed only on client side
  });
});
```

Then you need to declare it in your project config: `uvue.config.js`

```js
module.exports = {
  plugins: [
    // Simple install
    '@/plugins/foo.js',
    // Or you can pass options like this
    [
      '@/plugins/foo.js',
      {
        clientOnly: true, // Here the plugin will be only included on client side
        someVar: 'someValue',
      }
    ],
  ]
};
```

### Use Axios

Like in previous version of UVue, you'll have to avoid stateful singleton. In case of axios, you don't want to share the axios instance accross all HTTP requests because you can store some credentials in it.

To do this you have to define an UVue plugin, create your instance and inject it to the UVue context to securely use it in your app.

Example of plugin:

```ts
// src/plugins/axios.ts

import axios, { AxiosInstance } from 'axios';

// Main UVue plugin function
export default definePlugin((context: UVueContext, inject: UVueInject) => {
  const http = axios.create();

  // Inject this axios instance at some useful places
  // You can get it in:
  // - In setup function: `const { $http } = useContext()`
  // - In your components with options API: `this.$http`
  inject('http', http);
});

// Simple composable to get the axios instance in setup functions
export function useHttp() {
  const context = useContext();
  return context.$http;
}

// TypeScript: You can attach this axios instance to existing types
declare module '@uvue/core' {
  export interface ContextCustomProperties {
    $http: AxiosInstance;
  }
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $http: AxiosInstance;
  }
}
```

Define your plugin in the UVue configuration file:

```js
// uvue.config.js

module.exports = {
  plugins: [
    '@/plugins/axios',
  ],
};
```

Finally use it in your components:

```ts
// src/components/Foo.vue

import { useHttp } from '@/plugins/axios';

export default defineComponent(() => {
  // Get our axios instance
  const http = useHttp();

  const { data } = usePrefetch(async () => {
    // And use it here!
    const response = await http.get('http://example.com');
    return reponse.data;
  });

  return { data };
});
```

### Have a store

#### Use Vue reactive object

The most easiest way to have a little store in your application is to use reactivity features from Vue 3. In this case you can use an UVue plugin.

In the demo repository, global state is used to store current logged user:

1. [Create a plugin, and create a new `reactive()` object](https://github.com/universal-vue/demo/blob/main/src/plugins/globalState.ts)
2. [Add plugin to your project config](https://github.com/universal-vue/demo/blob/main/uvue.config.js#L10)
3. Use it in your application:
  - [Use them in your components](https://github.com/universal-vue/demo/blob/main/src/components/MainFooter.vue#L18-L25)
  - [Update data in your components methods](https://github.com/universal-vue/demo/blob/main/src/views/LoginView.vue#L49-L65)

#### With Pinia

Still very experimental, but you can already play with it: use Pinia!

In the demo repository, Pinia is used to make a cart, we can add and remove products from it:

1. [Setup the pinia plugin](https://github.com/universal-vue/demo/blob/main/src/plugins/pinia.ts)
2. [Add plugin to your config](https://github.com/universal-vue/demo/blob/main/uvue.config.js#L9)
3. Use it in your application:
  - [Add a product to cart](https://github.com/universal-vue/demo/blob/main/src/components/products/ProductAddToCart.vue)
  - [Count products](https://github.com/universal-vue/demo/blob/main/src/components/cart/CartButton.vue)
  - [Manage products in the cart](https://github.com/universal-vue/demo/blob/main/src/views/CartView.vue)

## Create a server plugin

Server plugin can act during the render phase done on server side. You can skip rendering, modify stuff before rendering the entire HTML page. Like previous plugins system, a plugin is just function that can declare callbacks to execute at different stage of rendering:

```ts
import { defineServerPlugin, ProjectConfig } from '@uvue/service';

export default defineServerPlugin((options: any, config: ProjectConfig) => {
  // To modify current webpack config
  onWebpackConfig((side: string, config: WebpackChain) => {});

  // Before app is rendered
  onRunnerBeforeRender(async (context: Context, result: RunnerResult) => {
    // You can avoid rendering by doing this:
    result.skipRender = true;
    result.html = 'Hello world';
    result.status = 200;
    result.headers = {
      custom: 'foo bar baz',
    };
  });

  // When app is rendered successfully
  onRunnerRenderResult(async (context: Context, result: RunnerResult) => {});

  // When app rendering throw an error
  onRunnerRenderError(async (context: Context, result: RunnerResult, error: Error) => {});

  // When UVue is building <head>
  onRendererHead(async (context: Context) => {
    // If you return a string, this will be added in your <head> tag
    return '<meta name="foo" content="bar" />';
  });

  // When UVue is building data stuff (window._UVUE_)
  onRendererData(async (context: Context) => {
    // Same here you can return html
    return '<script>window.FOO="bar";</script>';
  });

  // When UVue is building <script> includes
  onRendererScripts(async (context: Context) => {
    // Same here you can return html
    return '<script src="/foo.j">';
  });

  // Entire HTML page is built
  onRendererPage(async (context: Context, html: string) => {
    // html: the resut from UVue
    // You can alter output, just return a string:
    return `
      <!doctype html>
      <html>
        ...
      </html>
    `;
  });
});
```

### Create a bundle

Bundle is something like a module on Nuxt. With it you can declare multiple plugins and server plugins in one place easly:

```ts
import { defineBundle } from '@uvue/service';

export default defineBundle(
  ({ addPlugin, addServerPlugin }, options: any, config: ProjectConfig) => {
    addPlugin(__dirname + '/plugin.js');
    addServerPlugin(__dirname + '/plugin-server.js');
  },
);
```

### Have a runtime config

Good example of what you can do with a bundle: runtime config feature. You need a server plugin and an UVue config. First one, will build data sended to the Vue app. We need to have full data on server side, but a truncated version for client side (for security reasons). The UVue plugin will read this data an make it available in all the components.

[You can see source code here](https://github.com/universal-vue/demo/tree/main/src/bundles/runtimeConfig)

### Define 404 not found page

[You can see an example here](https://github.com/universal-vue/demo/blob/main/src/views/NotFound.ts)

## Roadmap

- [ ] SPA routes
- [ ] Customize server error page
- [ ] Client only component
- [ ] Full static mode
- [ ] Bundle starter
- [ ] More tests!
- [ ] Critical CSS
- [ ] Vue CLI plugin with codemods