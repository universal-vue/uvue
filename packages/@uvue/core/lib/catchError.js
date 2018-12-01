import UVue from '@uvue/core';
import { RedirectError, doRedirect } from './redirect';

export class VueError extends Error {
  constructor(originalError, vm, info) {
    super(originalError.message);
    this.originalError = originalError;
    this.vm = vm;
    this.info = info;
  }
}

export const catchError = (context, run) => {
  try {
    run();
  } catch (err) {
    if (err instanceof RedirectError) {
      doRedirect(context, err);
    } else {
      UVue.invoke('catchError', context, err);
    }
  }
};

export const catchErrorAsync = async (context, run) => {
  try {
    await run();
  } catch (err) {
    if (err instanceof RedirectError) {
      doRedirect(context, err);
    } else {
      UVue.invoke('catchError', context, err);
    }
  }
};
