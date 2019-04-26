/**
 * Return a new context based on app context with route informations
 * Used in routeResolve
 */
export default (context, guardContext = {}) => {
  let { to: route, from } = guardContext;
  const { router } = context;

  // Take the right current route to resolve
  route = route || context.route || router.currentRoute;

  // Create a new context
  return {
    ...context,
    route,
    from,
    routeComponents: router.getMatchedComponents(route),
    params: route.params,
    query: route.query,
    url: route.fullPath,
  };
};
