export const promiseData = (value, time = 0) => {
  return new Promise(resolve => setTimeout(() => resolve(value), time));
};
