import Vue from 'vue';

export default {
  /**
   * Setup error handler dans some helpers functions
   */
  beforeCreate(context) {
    const { router } = context;

    // Create error hanlder object to store current error
    Vue.util.defineReactive(Vue.prototype, '$errorHandler', {
      error: null,
      statusCode: null,
    });

    // Take this object to use later
    this.errorHandler = Vue.prototype.$errorHandler;

    // Create error helper function and add it to context
    context.error = (error, statusCode = 500) => {
      if (typeof error === 'string') {
        error = new Error(error);
      }
      error.statusCode = statusCode;
      throw error;
    };

    // Attach a way to clear error to this helper
    context.error.clear = () => this.clearError();

    // Attach error helper function to components and Vue object
    Vue.error = Vue.prototype.$error = (error, statusCode = 500) => {
      this.setError({
        error,
        statusCode,
      });
    };

    Vue.error.clear = () => this.clearError();

    if (process.client) {
      // Catch Vue errors
      Vue.config.errorHandler = (error, vm, info) => {
        this.setError({
          error,
          info,
          vm,
        });
      };
    }

    // Catch error in router navigation guards
    router.onError(error => {
      this.setError(error);
    });
  },

  /**
   * If we have an error during SSR process fetch it
   * and hydrate client with it
   */
  beforeStart() {
    if (process.client && process.ssr && window.__DATA__.errorHandler) {
      const { error, statusCode } = window.__DATA__.errorHandler;
      this.errorHandler.error = error;
      this.errorHandler.statusCode = statusCode;
    }
  },

  /**
   * On route error populate our error handler
   */
  routeError(error) {
    this.setError({
      error,
    });
  },

  /**
   * Before SSR process finish: get current state for error handler
   * and set status code if needed
   */
  beforeReady({ ssr }) {
    if (process.server && this.errorHandler.error) {
      ssr.data.errorHandler = this.errorHandler;
      ssr.statusCode = this.errorHandler.statusCode || 500;
    }
  },

  /**
   * Main function to process current error
   */
  setError(data) {
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
    this.errorHandler.error = error;
    this.errorHandler.statusCode = error.statusCode || statusCode || 500;
  },

  /**
   * Clear current error
   */
  clearError() {
    this.errorHandler.error = null;
    this.errorHandler.statusCode = null;
  },
};
