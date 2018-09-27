export default (value, time = 0) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (value instanceof Error) {
        reject(value);
      } else {
        resolve(value);
      }
    }, time);
  });
};
