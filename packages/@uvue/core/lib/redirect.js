/**
 * Redirect error
 * Will stop next executions to do a clean redirect
 */
export class RedirectError extends Error {
  constructor(location, statusCode = 301) {
    super('REDIRECT_ERROR');
    this.location = location;
    this.statusCode = statusCode;
  }
}

/**
 * Return redirect function for context
 */
export const getRedirect = ({ ssr }) => {
  return (location, statusCode = 301) => {
    const redirectError = new RedirectError(location, statusCode);
    if (process.server) ssr.redirected = statusCode;
    throw redirectError;
  };
};

/**
 * Simply do a redirect
 * Distinct process for server & client side
 */
export const doRedirect = ({ res, ssr, router }, { location, statusCode }) => {
  if (process.client) {
    // Client side
    router.replace(location);
  } else {
    // Server side
    if (typeof location === 'object') {
      location = router.resolve(location, router.currentRoute).href;
    }

    ssr.redirected = res.statusCode = statusCode;

    res.writeHead(statusCode, {
      Location: location,
    });
    res.end(location);
  }
};
