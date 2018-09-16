export default {
  async routeResolve(context) {
    const { url, redirect } = context;

    if (url === '/redirect-route') {
      redirect('/');
    }
  },
};
