import UVue from './UVue';
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
  } catch (error) {
    if (error instanceof RedirectError) {
      doRedirect(context, error);
    } else {
      UVue.invoke('catchError', context, error);

      emitServerError(context, {
        from: 'errorHandler',
        error,
      });
    }
  }
};

export const catchErrorAsync = async (context, run) => {
  try {
    await run();
  } catch (error) {
    if (error instanceof RedirectError) {
      doRedirect(context, error);
    } else {
      UVue.invoke('catchError', context, error);

      emitServerError(context, {
        from: 'errorHandler',
        error,
      });
    }
  }
};

export const emitServerError = (context, data) => {
  if (process.server && context.ssr.events) {
    const { events } = context.ssr;
    if (events) events.emit('error', data);
  }
};
