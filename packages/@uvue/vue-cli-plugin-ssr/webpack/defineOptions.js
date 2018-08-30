module.exports = (options = {}) => {
  const opts = Object.assign({ client: true, ssr: false }, options);
  const { client, ssr } = opts;

  return {
    'process.dev': process.env.NODE_ENV === 'production' ? 'false' : 'true',
    'process.prod': process.env.NODE_ENV === 'production' ? 'true' : 'false',
    'process.test': process.env.NODE_ENV === 'test' ? 'true' : 'false',
    'process.client': client ? 'true' : 'false',
    'process.server': client ? 'false' : 'true',
    'process.spa': ssr ? 'false' : 'true',
    'process.ssr': ssr ? 'true' : 'false',
  };
};
