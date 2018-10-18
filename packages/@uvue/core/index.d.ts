import './global';
import Vue from 'vue';
import { Store } from 'vuex';
import VueRouter, { Route } from 'vue-router';

/**
 * VueNeue
 */
declare module 'vue/types/vue' {
  interface Vue {
    $error: (error: any, statusCode?: number) => void;
    $context: {
      app: Vue;
      router: VueRouter;
      store: Store<any>;
      url: string;
      route: Route;
      query: any;
      params: any;
      redirect: (location: any, statusCode?: number) => void;
      error: (error: any, statusCode?: number) => void;
    };
  }
}
