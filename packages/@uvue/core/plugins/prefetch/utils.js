export function hasPrefetch(vm) {
  return vm.$options && typeof vm.$options.prefetch === 'function';
}
