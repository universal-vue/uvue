/// <reference path="./index.d.ts"/>

// @ts-ignore
import Component from 'vue-class-component';

Component.registerHooks([
  'asyncData',
  'fetch',
  'middlewares',
  'beforeRouteEnter',
  'beforeRouteLeave',
  'beforeRouteUpdate',
]);
