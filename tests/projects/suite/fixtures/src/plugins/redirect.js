export default {
  async routeResolve(context) {
    const { url, redirect } = context;

    if (url === '/redirect-route' || url === '/spa/redirect-route') {
      redirect('/');
    }
  },
};
