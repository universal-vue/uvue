export default async (context, guardArgs = {}) => {
  const { next } = guardArgs;

  // TODO

  if (next) next();
};
