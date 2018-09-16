import UVue from '@uvue/core';

const RedirectPlugin = {
  async routeResolve(context) {
    const { url, redirect } = context;

    if (url === '/redirect-route') {
      redirect('/');
    }
  },
};

UVue.use(RedirectPlugin);
