import Vue from 'vue';

export default {
  /**
   * Setup error handler dans some helpers functions
   */
  beforeCreate(context) {
    // Create error hanlder object to store current error
    if (process.server) {
      // On server side: create simple object
      context.$errorHandler = {
        error: null,
        statusCode: null,
      };
    } else {
      // On client side: create a reactive object
      Vue.util.defineReactive(context, '$errorHandler', {
        error: null,
        statusCode: null,
      });
    }

    // Getter to use it in Vue render
    Object.defineProperty(Vue.prototype, '$errorHandler', {
      configurable: true,
      enumerable: false,
      get() {
        return context.$errorHandler;
      },
    });

    // Create error helper function and add it to context
    context.error = (error, statusCode = 500) => {
      if (typeof error === 'string') {
        error = new Error(error);
      }
      error.statusCode = statusCode;
      // Throw this error
      throw error;
    };

    // Attach a way to clear error to this helper
    context.error.clear = () => this.clearError(context);

    // Attach error helper function to components and Vue object
    Vue.error = Vue.prototype.$error = (error, statusCode = 500) => {
      this.setError(
        {
          error,
          statusCode,
        },
        context,
      );
    };

    Vue.error.clear = () => this.clearError(context);

    if (process.client) {
      // Catch Vue errors
      Vue.config.errorHandler = (error, vm, info) => {
        this.setError(
          {
            error,
            info,
            vm,
          },
          context,
        );
      };
    }
  },

  /**
   * If we have an error during SSR process fetch it
   * and hydrate client with it
   */
  beforeStart({ $errorHandler }) {
    if (process.client && process.ssr && window.__DATA__ && window.__DATA__.errorHandler) {
      const { error, statusCode } = window.__DATA__.errorHandler;
      $errorHandler.error = error;
      $errorHandler.statusCode = statusCode;
    }
  },

  /**
   * On route error populate our error handler
   */
  routeError(error, context) {
    this.setError(
      {
        error,
      },
      context,
    );
  },

  /**
   * Before SSR process finish: get current state for error handler
   * and set status code if needed
   */
  beforeReady({ ssr, $errorHandler }) {
    if (process.server && $errorHandler.error) {
      // Try to serialize error object
      if ($errorHandler.error instanceof Error) {
        const error = {
          message: $errorHandler.error.message,
          stack: $errorHandler.error.stack,
        };
        for (const key in $errorHandler.error) {
          error[key] = $errorHandler.error[key];
        }
        $errorHandler.error = error;
      }

      ssr.data.errorHandler = $errorHandler;
      ssr.statusCode = $errorHandler.statusCode || 500;
    }
  },

  /**
   * Main function to process current error
   */
  setError(data, { $errorHandler }) {
    let { error, info, statusCode, vm } = data;

    if (!error) return;

    if (process.client) {
      // On client side show errors in console for debug purpose
      if (process.env.NODE_ENV !== 'production') {
        if (info) {
          Vue.util.warn(`Error in ${info}: "${error.toString()}"`, vm);
        } else {
          Vue.util.warn(error);
        }
      } else if (process.env.VUE_APP_ENABLE_ERROR_LOGS) {
        // eslint-disable-next-line
        console.error(error.stack || error.message || error);
      }
    }

    // Set data to error handler store
    $errorHandler.error = error;
    $errorHandler.statusCode = error.statusCode || statusCode || 500;
  },

  /**
   * Clear current error
   */
  clearError({ $errorHandler }) {
    $errorHandler.error = null;
    $errorHandler.statusCode = null;
  },
};
