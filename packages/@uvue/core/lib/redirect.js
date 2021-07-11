/**
 * Redirect error
 * Will stop next executions to do a clean redirect
 */
export class RedirectError extends Error {
  constructor(location, statusCode = 302) {
    super('REDIRECT_ERROR');
    this.location = location;
    this.statusCode = statusCode;
  }
}

/**
 * Return redirect function for context
 */
export const getRedirect = ({ ssr, isServer }) => {
  return (location, statusCode = 302) => {
    const redirectError = new RedirectError(location, statusCode);
    if (isServer) ssr.redirected = statusCode;
    throw redirectError;
  };
};

/**
 * Simply do a redirect
 * Distinct process for server & client side
 */
export const doRedirect = ({ app, res, ssr, router, isClient }, { location, statusCode }) => {
  if (typeof location === 'object') {
    location = router.resolve(location, router.currentRoute).href;
  }

  if (app) {
    app.$emit('router.redirect');
  }

  if (isClient) {
    // Client side
    try {
      window.location = new URL(location);
    } catch {
      router.replace(location);
    }
  } else {
    // Server side
    ssr.redirected = {
      location,
      statusCode,
    };

    res.writeHead(statusCode, {
      Location: location,
    });
    res.end(location);
  }
};
