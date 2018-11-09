import path from 'path';
import { Server, Renderer } from '@uvue/server';
import EventEmitter from 'events';

const mockServer = () => {
  const server = new Server({
    paths: {
      outputDir: path.resolve('packages/tests/suite/dist'),
      serverBundle: '.uvue/server-bundle.json',
      clientManifest: '.uvue/client-manifest.json',
      templates: {
        spa: '.uvue/spa.html',
        ssr: '.uvue/ssr.html',
      },
    },
    httpOptions: {
      host: '127.0.0.1',
      port: '7357',
    },
  });

  const pluginOptions = {
    events: new EventEmitter(),
    beforeStart: false,
    beforeRender: false,
    beforeBuild: false,
    rendered: false,
  };

  server.addPlugin(testServerPlugin, pluginOptions);

  const { clientManifest, serverBundle, templates } = server.getBuiltFiles();
  const renderer = new Renderer(serverBundle, {
    clientManifest,
    templates,
  });

  server.renderer = renderer;

  return { server, renderer, plugin: testServerPlugin };
};

const mockContext = (url = '/') => {
  return {
    url,
    data: {},
    renderStyles() {
      return '';
    },
    renderResourceHints() {
      return '';
    },
    renderScripts() {
      return '';
    },
  };
};

const testServerPlugin = {
  install(app, options) {
    this.$options = options;
    this.$options.install = true;

    this.events = this.$options.events;
  },

  beforeStart() {
    this.events.emit('beforeStart');
  },

  beforeRender() {
    this.$options.beforeRender = true;
  },

  beforeBuild() {
    this.$options.beforeBuild = true;
  },

  rendered() {
    this.$options.rendered = true;
  },

  routeError() {
    this.events.emit('routeError');
  },

  afterResponse() {
    this.events.emit('afterResponse');
  },
};

module.exports = {
  mockServer,
  mockContext,
  testServerPlugin,
};
