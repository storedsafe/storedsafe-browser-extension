/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/scripts/background.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/axios/index.js":
/*!*************************************!*\
  !*** ./node_modules/axios/index.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./lib/axios */ "./node_modules/axios/lib/axios.js");

/***/ }),

/***/ "./node_modules/axios/lib/adapters/xhr.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/adapters/xhr.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var settle = __webpack_require__(/*! ./../core/settle */ "./node_modules/axios/lib/core/settle.js");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ "./node_modules/axios/lib/core/buildFullPath.js");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ "./node_modules/axios/lib/helpers/parseHeaders.js");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ "./node_modules/axios/lib/helpers/isURLSameOrigin.js");
var createError = __webpack_require__(/*! ../core/createError */ "./node_modules/axios/lib/core/createError.js");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies = __webpack_require__(/*! ./../helpers/cookies */ "./node_modules/axios/lib/helpers/cookies.js");

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/axios.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/axios.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");
var Axios = __webpack_require__(/*! ./core/Axios */ "./node_modules/axios/lib/core/Axios.js");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");
var defaults = __webpack_require__(/*! ./defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(/*! ./cancel/Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ "./node_modules/axios/lib/cancel/CancelToken.js");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ "./node_modules/axios/lib/helpers/spread.js");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/Cancel.js":
/*!*************************************************!*\
  !*** ./node_modules/axios/lib/cancel/Cancel.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/CancelToken.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Cancel = __webpack_require__(/*! ./Cancel */ "./node_modules/axios/lib/cancel/Cancel.js");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ "./node_modules/axios/lib/cancel/isCancel.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/cancel/isCancel.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/Axios.js":
/*!**********************************************!*\
  !*** ./node_modules/axios/lib/core/Axios.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ "./node_modules/axios/lib/helpers/buildURL.js");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ "./node_modules/axios/lib/core/InterceptorManager.js");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ "./node_modules/axios/lib/core/dispatchRequest.js");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ "./node_modules/axios/lib/core/mergeConfig.js");

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ "./node_modules/axios/lib/core/InterceptorManager.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ "./node_modules/axios/lib/core/buildFullPath.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/buildFullPath.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ "./node_modules/axios/lib/helpers/isAbsoluteURL.js");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ "./node_modules/axios/lib/helpers/combineURLs.js");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/createError.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/createError.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var enhanceError = __webpack_require__(/*! ./enhanceError */ "./node_modules/axios/lib/core/enhanceError.js");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ "./node_modules/axios/lib/core/dispatchRequest.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");
var transformData = __webpack_require__(/*! ./transformData */ "./node_modules/axios/lib/core/transformData.js");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ "./node_modules/axios/lib/cancel/isCancel.js");
var defaults = __webpack_require__(/*! ../defaults */ "./node_modules/axios/lib/defaults.js");

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/core/enhanceError.js":
/*!*****************************************************!*\
  !*** ./node_modules/axios/lib/core/enhanceError.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/mergeConfig.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/core/mergeConfig.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'params', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy'];
  var defaultToConfig2Keys = [
    'baseURL', 'url', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress',
    'maxContentLength', 'validateStatus', 'maxRedirects', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath'
  ];

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, function mergeDeepProperties(prop) {
    if (utils.isObject(config2[prop])) {
      config[prop] = utils.deepMerge(config1[prop], config2[prop]);
    } else if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    } else if (utils.isObject(config1[prop])) {
      config[prop] = utils.deepMerge(config1[prop]);
    } else if (typeof config1[prop] !== 'undefined') {
      config[prop] = config1[prop];
    }
  });

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    } else if (typeof config1[prop] !== 'undefined') {
      config[prop] = config1[prop];
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys);

  var otherKeys = Object
    .keys(config2)
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, function otherKeysDefaultToConfig2(prop) {
    if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    } else if (typeof config1[prop] !== 'undefined') {
      config[prop] = config1[prop];
    }
  });

  return config;
};


/***/ }),

/***/ "./node_modules/axios/lib/core/settle.js":
/*!***********************************************!*\
  !*** ./node_modules/axios/lib/core/settle.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var createError = __webpack_require__(/*! ./createError */ "./node_modules/axios/lib/core/createError.js");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ "./node_modules/axios/lib/core/transformData.js":
/*!******************************************************!*\
  !*** ./node_modules/axios/lib/core/transformData.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),

/***/ "./node_modules/axios/lib/defaults.js":
/*!********************************************!*\
  !*** ./node_modules/axios/lib/defaults.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

var utils = __webpack_require__(/*! ./utils */ "./node_modules/axios/lib/utils.js");
var normalizeHeaderName = __webpack_require__(/*! ./helpers/normalizeHeaderName */ "./node_modules/axios/lib/helpers/normalizeHeaderName.js");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ./adapters/xhr */ "./node_modules/axios/lib/adapters/xhr.js");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ./adapters/http */ "./node_modules/axios/lib/adapters/xhr.js");
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/axios/lib/helpers/bind.js":
/*!************************************************!*\
  !*** ./node_modules/axios/lib/helpers/bind.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/buildURL.js":
/*!****************************************************!*\
  !*** ./node_modules/axios/lib/helpers/buildURL.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/combineURLs.js":
/*!*******************************************************!*\
  !*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/cookies.js":
/*!***************************************************!*\
  !*** ./node_modules/axios/lib/helpers/cookies.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isAbsoluteURL.js":
/*!*********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/isURLSameOrigin.js":
/*!***********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ "./node_modules/axios/lib/helpers/normalizeHeaderName.js":
/*!***************************************************************!*\
  !*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ../utils */ "./node_modules/axios/lib/utils.js");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/parseHeaders.js":
/*!********************************************************!*\
  !*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./../utils */ "./node_modules/axios/lib/utils.js");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ "./node_modules/axios/lib/helpers/spread.js":
/*!**************************************************!*\
  !*** ./node_modules/axios/lib/helpers/spread.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ "./node_modules/axios/lib/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/axios/lib/utils.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bind = __webpack_require__(/*! ./helpers/bind */ "./node_modules/axios/lib/helpers/bind.js");

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Function equal to merge with the difference being that no reference
 * to original objects is kept.
 *
 * @see merge
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function deepMerge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = deepMerge(result[key], val);
    } else if (typeof val === 'object') {
      result[key] = deepMerge({}, val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  deepMerge: deepMerge,
  extend: extend,
  trim: trim
};


/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/storedsafe/dist/index.js":
/*!***********************************************!*\
  !*** ./node_modules/storedsafe/dist/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(__webpack_require__(/*! axios */ "./node_modules/axios/index.js"));
var LoginType;
(function (LoginType) {
    LoginType["TOTP"] = "totp";
    LoginType["SMARTCARD"] = "smc_rest";
})(LoginType = exports.LoginType || (exports.LoginType = {}));
var StoredSafe = /** @class */ (function () {
    function StoredSafe(_a, version) {
        var host = _a.host, apikey = _a.apikey, token = _a.token;
        if (version === void 0) { version = '1.0'; }
        this.axios = axios_1.default.create({
            baseURL: "https://" + host + "/api/" + version + "/",
            timeout: 5000,
        });
        this.apikey = apikey;
        this.token = token;
    }
    StoredSafe.prototype.assertApikeyExists = function () {
        if (this.apikey === undefined) {
            throw new Error('Path requires apikey, apikey is undefined.');
        }
    };
    StoredSafe.prototype.assertTokenExists = function () {
        if (this.token === undefined) {
            throw new Error('Path requires token, token is undefined.');
        }
    };
    StoredSafe.prototype.loginYubikey = function (username, passphrase, otp) {
        var _this = this;
        this.assertApikeyExists();
        return this.axios.post('/auth', {
            username: username,
            keys: "" + passphrase + this.apikey + otp,
        }).then(function (response) {
            _this.token = response.data.CALLINFO.token;
            return response;
        });
    };
    StoredSafe.prototype.loginTotp = function (username, passphrase, otp) {
        var _this = this;
        this.assertApikeyExists();
        return this.axios.post('/auth', {
            username: username,
            passphrase: passphrase,
            otp: otp,
            logintype: LoginType.TOTP,
            apikey: this.apikey,
        }).then(function (response) {
            _this.token = response.data.CALLINFO.token;
            return response;
        });
    };
    StoredSafe.prototype.loginSmartcard = function (username, passphrase, otp) {
        var _this = this;
        this.assertApikeyExists();
        return this.axios.post('/auth', {
            username: username,
            passphrase: passphrase,
            otp: otp,
            logintype: LoginType.SMARTCARD,
            apikey: this.apikey,
        }).then(function (response) {
            _this.token = response.data.CALLINFO.token;
            return response;
        });
    };
    StoredSafe.prototype.logout = function () {
        var _this = this;
        this.assertTokenExists();
        return this.axios.get('/auth/logout', {
            headers: { 'X-Http-Token': this.token },
        }).then(function (response) {
            _this.token = undefined;
            return response;
        });
    };
    StoredSafe.prototype.check = function () {
        this.assertTokenExists();
        return this.axios.post('/auth/check', {}, {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.listVaults = function () {
        this.assertTokenExists();
        return this.axios.get('/vault', {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.vaultObjects = function (id) {
        this.assertTokenExists();
        return this.axios.get("/vault/" + id, {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.vaultMembers = function (id) {
        this.assertTokenExists();
        return this.axios.get("/vault/" + id + "/members", {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.createVault = function (params) {
        this.assertTokenExists();
        return this.axios.post('/vault', __assign({}, params), {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.editVault = function (id, params) {
        this.assertTokenExists();
        return this.axios.put("/vault/" + id, __assign({}, params), {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.deleteVault = function (id) {
        this.assertTokenExists();
        return this.axios.delete("/vault/" + id, {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.object = function (id, children) {
        if (children === void 0) { children = false; }
        this.assertTokenExists();
        return this.axios.get("/object/" + id, {
            params: { children: children },
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.decryptObject = function (id) {
        this.assertTokenExists();
        return this.axios.get("/object/" + id, {
            params: { decrypt: true },
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.createObject = function (params) {
        this.assertTokenExists();
        return this.axios.post('/object', __assign({}, params), {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.editObject = function (id, params) {
        this.assertTokenExists();
        return this.axios.put("/object/" + id, __assign({}, params), {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.deleteObject = function (id) {
        this.assertTokenExists();
        return this.axios.delete("/object/" + id, {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.find = function (needle) {
        this.assertTokenExists();
        return this.axios.get('/find', {
            params: { needle: needle },
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.listTemplates = function () {
        this.assertTokenExists();
        return this.axios.get('/template', {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.template = function (id) {
        this.assertTokenExists();
        return this.axios.get("/template/" + id, {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.permissionBits = function () {
        this.assertTokenExists();
        return this.axios.get('/utils/statusvalues', {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.passwordPolicies = function () {
        this.assertTokenExists();
        return this.axios.get('/utils/policies', {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.version = function () {
        this.assertTokenExists();
        return this.axios.get('/utils/version', {
            headers: { 'X-Http-Token': this.token },
        });
    };
    StoredSafe.prototype.generatePassword = function (params) {
        if (params === void 0) { params = {}; }
        this.assertTokenExists();
        return this.axios.get('utils/pwgen', {
            headers: { 'X-Http-Token': this.token },
            params: params,
        });
    };
    return StoredSafe;
}());
exports.default = StoredSafe;


/***/ }),

/***/ "./src/model/storage/Sessions.ts":
/*!***************************************!*\
  !*** ./src/model/storage/Sessions.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Abstraction layer for browser storage API to handle persisting StoredSafe
 * sessions as a means of indicating whether a user is logged into a site or
 * not. The extension background script is expected to set/clear this storage
 * area as a user performs a login/logout action or when a session times out.
 * - get/set functions handle all storage interaction.
 * - actions object provides the public interface for the model.
 * */
Object.defineProperty(exports, "__esModule", { value: true });
exports.actions = void 0;
/**
 * Get sessions from local storage.
 * @returns Promise containing all currently active sessions.
 * */
const get = () => (browser.storage.local.get('sessions')
    .then(({ sessions }) => {
    return new Map(sessions || []);
}));
/**
 * Commit Sessions object to sync storage.
 * @param sessions - All currently active sessions.
 * @returns Empty promise.
 * */
const set = (sessions) => (browser.storage.local.set({
    sessions: Array.from(sessions),
}));
exports.actions = {
    /**
     * Add new session to storage.
     * @param host - Host that the session is associated with.
     * @param session - New session data.
     * @returns Updated active sessions.
     * */
    add: (host, session) => (get().then((sessions) => {
        const newSessions = new Map([...sessions, [host, session]]);
        return set(newSessions).then(get);
    })),
    /**
     * Remove sessions from storage.
     * @param hosts - Hosts that the sessions are associated with.
     * @returns Updated active sessions.
     * */
    remove: (...hosts) => (get().then((sessions) => {
        const newSessions = new Map(sessions);
        for (const host of hosts) {
            newSessions.delete(host);
        }
        return set(newSessions).then(get);
    })),
    /**
     * Clear all sessions.
     * @returns Updated active sessions (empty).
     * */
    clear: () => (set(new Map([])).then(get)),
    /**
     * Fetch sessions from storage.
     * @returns All active sessions.
     * */
    fetch: get,
};


/***/ }),

/***/ "./src/model/storage/Settings.ts":
/*!***************************************!*\
  !*** ./src/model/storage/Settings.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Abstraction layer for browser storage API to handle persisting options set
 * by the user or by the system administrator. User settings are persisted in
 * sync storage which syncs with your browser account if you're logged in.
 * Administrators can add custom default or enforced values using a managed
 * storage manifest which is loaded by this module.
 * - get/set functions handle all storage interaction.
 * - actions object provides the public interface for the model.
 *
 * Sync storage and managed storage as well as application defaults are merged
 * in this module per field using the following priority:
 * 1. Managed enforced
 * 2. Sync
 * 3. Managed defaults
 * 4. Application defaults
 *
 * When updating settings, all managed fields are silently ignored. The module
 * will however not prevent the setting of fields in sync storage that also exist
 * in managed enforced storage because when fetching settings, any such overlapping
 * fields will simply be ignored in favor of higher priority settings.
 * */
Object.defineProperty(exports, "__esModule", { value: true });
exports.actions = exports.fields = exports.defaults = void 0;
const systemStorage = browser.storage.managed;
const userStorage = browser.storage.sync;
/**
 * Default values for settings.
 * */
exports.defaults = {
    idleMax: 15,
    autoFill: false,
    maxTokenLife: 180,
};
/**
 * Fields to be passed to the React component that renders the form to update
 * settings.
 * */
exports.fields = {
    autoFill: {
        label: 'Auto Fill',
        attributes: {
            type: 'checkbox',
        },
    },
    idleMax: {
        label: 'Logout after being idle for',
        unit: 'minutes',
        attributes: {
            type: 'number',
            required: true,
            min: 1,
            max: 120,
        },
    },
    maxTokenLife: {
        label: 'Always log out after being online for',
        unit: 'hours',
        attributes: {
            type: 'number',
            required: true,
            min: 1,
        },
    },
};
/**
 * Populates given Settings object in-place.
 * @param settings - Existing settings to merge with.
 * @param values - Values to populate settings with.
 * @param managed - Whether or not the values are managed.
 * */
const populate = (settings, values, managed = false) => {
    Object.keys(values).forEach((key) => {
        if (!settings.has(key)) {
            settings.set(key, { managed, value: values[key] });
        }
    });
};
/**
 * Get settings from managed and sync storage and convert
 * into Settings object where enforced values from managed
 * storage are set as managed.
 * @returns Merged user and system settings.
 * */
const get = () => {
    const settings = new Map();
    return systemStorage.get('settings').catch(() => ({ settings: new Map([]) })).then(({ settings: system }) => {
        if (system && system.enforced) {
            populate(settings, system.enforced, true);
        }
        return userStorage.get('settings').then(({ settings: user }) => {
            if (user) {
                populate(settings, user);
            }
            if (system && system.defaults) {
                populate(settings, system.defaults);
            }
            populate(settings, exports.defaults);
            return settings;
        });
    });
};
/**
 * Commit user settings to sync storage.
 * @param settings - New user settings.
 * */
const set = (settings) => {
    const userSettings = {};
    for (const [key, field] of settings) {
        if (field.managed === false) {
            userSettings[key] = field.value;
        }
    }
    return userStorage.set({ settings: userSettings });
};
exports.actions = {
    /**
     * Update user settings. Managed fields will be ignored.
     * @param settings - Updated settings.
     * @returns New merged user and system settings.
     * */
    update: (updatedSettings) => {
        return get().then((settings) => {
            const newSettings = new Map([...settings, ...updatedSettings]);
            return set(newSettings).then(get);
        });
    },
    /**
     * Fetch settings from storage.
     * @returns Merged user and system settings.
     * */
    fetch: get,
};


/***/ }),

/***/ "./src/model/storage/TabResults.ts":
/*!*****************************************!*\
  !*** ./src/model/storage/TabResults.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Abstraction layer for browser storage API to handle persisting search
 * results related to a browser tab as a means of caching. The extension
 * background script is expected to set/clear this storage area as needed
 * to implement the actual caching.
 * - get/set functions handle all storage interaction.
 * - actions object provides the public interface for the model.
 * */
Object.defineProperty(exports, "__esModule", { value: true });
exports.actions = void 0;
/**
 * Get tab search results from local storage.
 * @returns Promise containing tab search results.
 * */
function get() {
    return browser.storage.local.get('tabResults').then(({ tabResults }) => {
        const serializedTabResults = (tabResults || []);
        // Convert nested serializable results to Map objects.
        return new Map(serializedTabResults.map(([k, v]) => [k, new Map(v)]));
    });
}
/**
 * Commit tab search results to local storage.
 * @param tabResults New tab search results.
 * */
function set(tabResults) {
    return browser.storage.local.set({
        // Convert nested Map objects to serializable results.
        tabResults: Array.from(tabResults).map(([k, v]) => [k, Array.from(v)]),
    });
}
exports.actions = {
    /**
     * Set search results for tab.
     * @param tabId - ID of tab associated with the results.
     * @param results - Results from active sites related to the tab.
     * @returns Updated cached results from all tabs.
     * */
    setTabResults: (tabId, results) => (get().then((prevTabResults) => {
        const newTabResults = new Map([...prevTabResults, [tabId, results]]);
        return set(newTabResults).then(get);
    })),
    /**
     * Remove search results for tab.
     * @param tabId - ID of tab associated with the results.
     * @returns Updated cached results from all tabs.
     * */
    removeTabResults: (tabId) => (get().then((prevResults) => {
        const newResults = new Map(prevResults);
        newResults.delete(tabId);
        return set(newResults).then(get);
    })),
    /**
     * Purge host from tab results.
     * @returns Updated cached results from all tabs, with values from host removed.
     * */
    purgeHost: (host) => (get().then((prevTabResults) => {
        const newTabResults = new Map(prevTabResults);
        for (const results of newTabResults.values()) {
            for (const resultsHost of results.keys()) {
                if (resultsHost === host) {
                    results.delete(host);
                }
            }
        }
        return set(newTabResults).then(get);
    })),
    /**
     * Clear all search results from storage.
     * @returns Updated cached results from all tabs (empty).
     * */
    clear: () => {
        return set(new Map()).then(get);
    },
    /**
     * Fetch all cached tab search results from storage.
     * @returns Cached results from all tabs.
     * */
    fetch: get,
};


/***/ }),

/***/ "./src/model/storedsafe/AuthHandler.ts":
/*!*********************************************!*\
  !*** ./src/model/storedsafe/AuthHandler.ts ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.actions = void 0;
/**
 * Login to StoredSafe.
 * @param request - Request callback function.
 * @param fields - Credentials and specification of login type.
 * @returns Session created from response if successful.
 * */
function login(request, fields) {
    return request((handler) => {
        let promise;
        if (fields.loginType === 'yubikey') {
            const { username, keys } = fields;
            const passphrase = keys.slice(0, -44);
            const otp = keys.slice(-44);
            promise = handler.loginYubikey(username, passphrase, otp);
        }
        else if (fields.loginType === 'totp') {
            const { username, passphrase, otp, } = fields;
            promise = handler.loginTotp(username, passphrase, otp);
        }
        return promise;
    }).then((data) => {
        const { token, audit, timeout } = data.CALLINFO;
        const violations = (Array.isArray(audit.violations) ? {} : audit.violations);
        const warnings = (Array.isArray(audit.warnings) ? {} : audit.warnings);
        return {
            token,
            createdAt: Date.now(),
            violations,
            warnings,
            timeout,
        };
    });
}
/**
 * Logout from StoredSafe
 * @param request - Request callback function.
 * @param host - Host related to the session to invalidate.
 * */
function logout(request) {
    return request((handler) => handler.logout()).then();
}
/**
 * Check if token is still valid and refresh the token if it is.
 * @param request - Request callback function.
 * @returns True if token is still valid, otherwise false.
 * */
function check(request) {
    return request((handler) => handler.check()).then(() => {
        return true;
    }).catch(() => {
        return false;
    });
}
exports.actions = {
    login,
    logout,
    check,
};


/***/ }),

/***/ "./src/model/storedsafe/MiscHandler.ts":
/*!*********************************************!*\
  !*** ./src/model/storedsafe/MiscHandler.ts ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.actions = void 0;
/**
 * Get the available vaults from the given site.
 * @param request - Request callback function.
 * @returns All available StoredSafe vaults on the host.
 * */
function getVaults(request) {
    return request((handler) => handler.listVaults()).then((data) => (data.VAULTS.map((vault) => ({
        id: vault.id,
        name: vault.groupname,
        canWrite: ['2', '4'].includes(vault.status),
    }))));
}
/**
 * Get the available templates from the given site.
 * @param request - Request callback function.
 * @returns All available StoredSafe templates on the host.
 * */
function getTemplates(request) {
    return request((handler) => handler.listTemplates()).then((data) => (data.TEMPLATE.map((template) => ({
        id: template.INFO.id,
        name: template.INFO.name,
        icon: template.INFO.ico,
        structure: Object.keys(template.STRUCTURE).map((fieldName) => {
            const field = template.STRUCTURE[fieldName];
            return {
                title: field.translation,
                name: fieldName,
                type: field.type,
                isEncrypted: field.encrypted,
            };
        }),
    }))));
}
/**
 * Generate a new password.
 * @param request - Request callback function.
 * @param params - Optional parameters for password generation.
 * @returns Generated password.
 * */
function generatePassword(request, params) {
    return request((handler) => handler.generatePassword(params)).then((data) => (data.CALLINFO.passphrase));
}
exports.actions = {
    getVaults,
    getTemplates,
    generatePassword,
};


/***/ }),

/***/ "./src/model/storedsafe/ObjectHandler.ts":
/*!***********************************************!*\
  !*** ./src/model/storedsafe/ObjectHandler.ts ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.actions = void 0;
/**
 * Helper function to parse objects and templates returned from a find request.
 * @param ssObject StoredSafe object.
 * @param @ssTemplate StoredSafe template.
 * @param isDecrypted Whether the object has just been decrypted.
 * @returns Parsed representation of object and template info.
 * */
const parseSearchResult = (ssObject, ssTemplate, isDecrypted = false) => {
    // Extract general object info
    const isFile = ssTemplate.info.file !== undefined;
    const name = isFile ? ssObject.filename : ssObject.objectname;
    const { id, templateid: templateId, groupid: vaultId } = ssObject;
    const { name: type, ico: icon } = ssTemplate.info;
    const fields = [];
    // Extract field info from template
    ssTemplate.structure.forEach((field) => {
        const { fieldname: fieldName, translation: title, encrypted: isEncrypted, policy: isPassword, } = field;
        // Value may be undefined if the field is encrypted
        const value = (isEncrypted
            ? (isDecrypted ? ssObject.crypted[field.fieldname] : undefined)
            : ssObject.public[field.fieldname]);
        // Add field to object fields
        fields.push({
            name: fieldName,
            title,
            value,
            isEncrypted,
            isPassword,
        });
    });
    // Compile all parsed information
    return { id, templateId, vaultId, name, type, icon, isDecrypted, fields };
};
/**
 * Find and parse StoredSafe objects matching the provided needle.
 * @param request - Request callback function.
 * @param needle - Search string to match against in StoredSafe.
 * @returns Results matching needle.
 * */
function find(request, needle) {
    return request((handler) => handler.find(needle)).then((data) => {
        const results = [];
        for (let i = 0; i < data.OBJECT.length; i++) {
            const ssObject = data.OBJECT[i];
            const ssTemplate = data.TEMPLATES.find((template) => template.id === ssObject.templateid);
            const isFile = ssTemplate.info.file !== undefined;
            if (isFile)
                continue; // Skip files
            results.push(parseSearchResult(ssObject, ssTemplate));
        }
        return results;
    });
}
/**
 * Decrypt StoredSafe object.
 * @param request - Request callback function.
 * @param objectId - ID in StoredSafe of object to decrypt.
 * @returns The decrypted object.
 * */
function decrypt(request, objectId) {
    return request((handler) => handler.decryptObject(objectId)).then((data) => {
        const ssObject = data.OBJECT.find((obj) => obj.id === objectId);
        const ssTemplate = data.TEMPLATES.find((template) => template.id === ssObject.templateid);
        return parseSearchResult(ssObject, ssTemplate, true);
    });
}
/**
 * Add object to StoredSafe.
 * @param request - Request callback function.
 * @param params - Object parameters based on the chosen StoredSafe template.
 * */
function add(request, params) {
    return request((handler) => handler.createObject(params)).then();
}
exports.actions = {
    find,
    decrypt,
    add,
};


/***/ }),

/***/ "./src/model/storedsafe/StoredSafe.ts":
/*!********************************************!*\
  !*** ./src/model/storedsafe/StoredSafe.ts ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Abstraction layer for the StoredSafe API wrapper to handle writing
 * relevant data to storage and parsing the raw StoredSafe response into
 * the more relevant application data structures.
 * - actions object provides the public interface for the model.
 * */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.actions = void 0;
const storedsafe_1 = __importDefault(__webpack_require__(/*! storedsafe */ "./node_modules/storedsafe/dist/index.js"));
const Sessions_1 = __webpack_require__(/*! ../storage/Sessions */ "./src/model/storage/Sessions.ts");
const TabResults_1 = __webpack_require__(/*! ../storage/TabResults */ "./src/model/storage/TabResults.ts");
const ObjectHandler_1 = __webpack_require__(/*! ./ObjectHandler */ "./src/model/storedsafe/ObjectHandler.ts");
const AuthHandler_1 = __webpack_require__(/*! ./AuthHandler */ "./src/model/storedsafe/AuthHandler.ts");
const MiscHandler_1 = __webpack_require__(/*! ./MiscHandler */ "./src/model/storedsafe/MiscHandler.ts");
/**
 * Helper function to handle errors when interacting with the StoredSafe API.
 * All StoredSafe requests with errors will look similar and therefore be
 * handled the same way.
 * @param promise - Promise returned by StoredSafe request.
 * @returns Data returned by StoredSafe or promise with error.
 * */
const handleErrors = (promise) => (promise.then((response) => {
    if (response.status === 200) {
        return response.data;
    }
    throw new Error(`StoredSafe Error: (${response.status}) ${response.statusText}`);
}).catch((error) => {
    if (error.response) {
        throw new Error(`StoredSafe Error: ${error.response.data.ERRORS.join(' | ')}`);
    }
    else if (error.request) {
        throw new Error(`Network Error: (${error.request.status}) ${error.request.statusText}`);
    }
    throw new Error(`Unexpected Error: ${error.message}`);
}));
/**
 * Get StoredSafe handler for the given host.
 * @param host - Host to connect to.
 * @returns StoredSafe handler or promise with error if no session was found.
 * */
function getHandler(host) {
    return Sessions_1.actions.fetch().then((sessions) => {
        if (sessions.get(host) === undefined) {
            throw new Error(`No active session for ${host}`);
        }
        const { token } = sessions.get(host);
        return new storedsafe_1.default({ host, token });
    });
}
/**
 * Create and perform initial handling of request.
 * @param host - Host to create handler callback for.
 * @returns Request function to be passed to sub-handlers.
 * */
function makeRequest(host) {
    const request = (cb) => (handleErrors(getHandler(host).then((handler) => cb(handler))));
    return request;
}
////////////////////////////////////////////////////////////
// auth
/**
 * Attempt login with given site.
 * @param site - Site to attempt login with.
 * @param fields - Credentials and specification of login type.
 * @returns Updated list of active sessions (if login is successful).
 * */
function login({ host, apikey }, fields) {
    const handler = new storedsafe_1.default({ host, apikey });
    const request = (cb) => (handleErrors(cb(handler)));
    return AuthHandler_1.actions.login(request, fields).then((session) => (Sessions_1.actions.add(host, session)));
}
/**
 * Logout from given site.
 * Will silently remove session even if logout fails.
 * @param host - Host related to the session to invalidate.
 * @returns Updated list of active sessions.
 * */
function logout(host) {
    return AuthHandler_1.actions.logout(makeRequest(host)).catch((error) => {
        console.error('StoredSafe Logout Error', error);
    }).then(() => (Sessions_1.actions.remove(host)));
}
/**
 * Logout from all sites.
 * Will silently remove sessions even if logout fails.
 * @returns Updated list of active sessions (empty).
 * */
function logoutAll() {
    return Sessions_1.actions.fetch().then((sessions) => {
        Array.from(sessions.keys()).forEach((host) => {
            AuthHandler_1.actions.logout(makeRequest(host)).catch((error) => {
                console.error('StoredSafe Logout Error', error);
            });
        });
        return Promise.resolve(Sessions_1.actions.clear());
    });
}
/**
 * Check if session is still valid, remove it if it's not.
 * @param host - Host related to the session to validate.
 * @returns Updated list of active sessions.
 * */
function check(host) {
    return AuthHandler_1.actions.check(makeRequest(host)).then((isValid) => {
        return isValid ? Sessions_1.actions.fetch() : Sessions_1.actions.remove(host);
    });
}
/**
 * Check if sessions are still valid, remove those that are not.
 * @returns Updated list of active sessions.
 * */
function checkAll() {
    return Sessions_1.actions.fetch().then((sessions) => __awaiter(this, void 0, void 0, function* () {
        const invalidHosts = [];
        for (const host of sessions.keys()) {
            const isValid = yield AuthHandler_1.actions.check(makeRequest(host));
            if (!isValid) {
                invalidHosts.push(host);
            }
        }
        return Sessions_1.actions.remove(...invalidHosts);
    }));
}
////////////////////////////////////////////////////////////
// object
/**
 * Find search results from given sites.
 * @param host - Host to perform search on.
 * @param needle - Search string to match against in StoredSafe.
 * @returns Matched results from host.
 * */
function find(host, needle) {
    return check(host).then(() => {
        return ObjectHandler_1.actions.find(makeRequest(host), needle).then((results) => {
            return results;
        });
    });
}
/**
 * Decrypt StoredSafe object.
 * @param host - Host to request decryption from.
 * @param objectId - ID in StoredSafe of object to decrypt.
 * @returns The decrypted object.
 * */
function decrypt(host, objectId) {
    return ObjectHandler_1.actions.decrypt(makeRequest(host), objectId);
}
/**
 * Add object to StoredSafe.
 * @param host - Host to add object to.
 * @param params - Object parameters based on the chosen StoredSafe template.
 * */
function addObject(host, params) {
    return ObjectHandler_1.actions.add(makeRequest(host), params);
}
/**
 * Find search results related to tab and put in storage
 * from all logged in sites.
 * @param tabId - The ID of the tab associated with the search.
 * @param needle - The search string to match against in StoredSafe.
 * @returns Updated list of all cached tab search results.
 * */
function tabFind(tabId, needle) {
    return Sessions_1.actions.fetch().then((sessions) => {
        const hosts = Array.from(sessions.keys());
        const promises = hosts.map((host) => {
            return find(host, needle).catch((error) => {
                // Log error rather than failing all results in Promise.all
                console.error(error);
            }).then((data) => data || []); // Ensure array
        });
        return Promise.all(promises).then((siteResults) => {
            const results = new Map();
            for (let i = 0; i < siteResults.length; i++) {
                results.set(hosts[i], siteResults[i]);
            }
            return TabResults_1.actions.setTabResults(tabId, results);
        });
    });
}
////////////////////////////////////////////////////////////
// misc
/**
 * Get info about site structure and capabilities.
 * @param host - Host to retreive info about.
 * @returns - Info regarding the structure of the site.
 * */
function getSiteInfo(host) {
    return getHandler(host).then((handler) => __awaiter(this, void 0, void 0, function* () {
        const request = (cb) => (handleErrors(cb(handler)));
        const vaults = yield MiscHandler_1.actions.getVaults(request);
        const templates = yield MiscHandler_1.actions.getTemplates(request);
        return { vaults, templates };
    }));
}
/**
 * Generate a new password.
 * @param host - Host to request a password from.
 * @param params - Optional parameters for password generation.
 * @returns Generated password.
 * */
function generatePassword(host, params) {
    return MiscHandler_1.actions.generatePassword(makeRequest(host), params);
}
exports.actions = {
    login,
    logout,
    logoutAll,
    check,
    checkAll,
    find,
    decrypt,
    tabFind,
    addObject,
    getSiteInfo,
    generatePassword,
};


/***/ }),

/***/ "./src/scripts/background.ts":
/*!***********************************!*\
  !*** ./src/scripts/background.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This script is run in the background by the browser as defined in the
 * extension manifest. In chrome it will run as an event page whereas in
 * firefox it will be persistent as firefox does not support event pages.
 *
 * All handling of browser events should be handled in this module to the
 * extent that it's possible. Message handling from the popup to the content
 * script can bypass the background script but messages from the content script
 * to the popup should be passed through the background script to ensure the
 * popup is available.
 * */
const StoredSafe_1 = __webpack_require__(/*! ../model/storedsafe/StoredSafe */ "./src/model/storedsafe/StoredSafe.ts");
const Sessions_1 = __webpack_require__(/*! ../model/storage/Sessions */ "./src/model/storage/Sessions.ts");
const Settings_1 = __webpack_require__(/*! ../model/storage/Settings */ "./src/model/storage/Settings.ts");
const TabResults_1 = __webpack_require__(/*! ../model/storage/TabResults */ "./src/model/storage/TabResults.ts");
////////////////////////////////////////////////////////////
// Session management functions and initialization
// Timers for invalidating sessions.
let sessionTimers = new Map();
let idleTimer;
/**
 * Invalidate a single session and destroy all cached search results for
 * that host.
 * @param host - Host of session to invalidate.
 * */
function invalidateSession(host) {
    console.log('Invalidating session: ', host);
    StoredSafe_1.actions.logout(host);
    TabResults_1.actions.purgeHost(host);
}
/**
 * Invalidate all sessions and clear search results.
 * */
function invalidateAllSessions() {
    console.log('Invalidating all sessions');
    StoredSafe_1.actions.logoutAll();
    TabResults_1.actions.clear();
}
/**
 * Helper function to get the amount of milliseconds since the token was
 * created.
 * */
function getTokenLife(createdAt) {
    return Date.now() - createdAt;
}
/**
 * Set up check timers to keep sessions alive.
 * */
function setupKeepAlive() {
    Sessions_1.actions.fetch().then((sessions) => {
        for (const [host, { timeout }] of sessions) {
            // Perform initial check in case we're picking up an old session
            // which will timeout in less than the saved timeout value.
            StoredSafe_1.actions.check(host);
            const interval = timeout * 0.75; // Leave a little margin
            console.log('Keepalive for', host, 'in', Math.floor(interval / 60000), 'minutes');
            setInterval(StoredSafe_1.actions.check, interval, host);
        }
    });
}
/**
 * Set up hard timers for session logout.
 * @param sessions - Currently active sessions.
 * */
function setupTimers(sessions) {
    Settings_1.actions.fetch().then((settings) => {
        for (const [host, session] of sessions) {
            const tokenLife = getTokenLife(session.createdAt);
            const maxTokenLife = settings.get('maxTokenLife').value;
            const tokenTimeout = maxTokenLife * 3600 * 10e3 - tokenLife;
            console.log('Invalidate', host, 'in', Math.floor(tokenTimeout / 6e5), 'minutes');
            sessionTimers.set(host, window.setTimeout(() => {
                console.log('Session timed out for ', host);
                invalidateSession(host);
            }, tokenTimeout));
        }
    });
}
/**
 * Helper function to convert a url to a search string.
 * ex. https://foo.example.com/home -> foo.example.com
 * @param url URL to convert into search string.
 * @returns Search string.
 * */
function urlToNeedle(url) {
    const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^/]*)\//i);
    return match !== null ? match[1] : url;
}
/**
 * Helper function to select the first result of all results if a result exists.
 * @param results - All search results related to tab.
 * TODO: Sort results on best match?
 * */
function selectResult(results) {
    for (const [host, ssObjects] of results) {
        if (ssObjects.length > 0) {
            return [host, ssObjects[0]];
        }
    }
    return [undefined, undefined];
}
/**
 * Decrypt result if needed.
 * */
function decryptResult(host, result) {
    return __awaiter(this, void 0, void 0, function* () {
        if (result.isDecrypted)
            return result;
        const hasEncrypted = result.fields.reduce((acc, field) => (acc || field.isEncrypted), false);
        if (hasEncrypted) {
            return yield StoredSafe_1.actions.decrypt(host, result.id);
        }
        return result;
    });
}
/**
 * Prepare fields for fill function and decrypt if needed.
 * */
function parseResult(result) {
    const data = new Map();
    for (const field of result.fields) {
        data.set(field.name, field.value);
    }
    return data;
}
/**
 * Fill form fields on tab.
 * */
function tabFill(tabId, data) {
    browser.tabs.sendMessage(tabId, {
        type: 'fill',
        data: [...data],
    });
}
/**
 * Parse and select result and decrypt as needed before filling form fields on tab.
 * */
function fill(tabId, results) {
    return __awaiter(this, void 0, void 0, function* () {
        const [host, result] = selectResult(results);
        if (result) {
            const decryptedResult = decryptResult(host, result);
            const data = parseResult(yield decryptedResult);
            tabFill(tabId, data);
        }
    });
}
/**
 * Find search results related to loaded tab.
 * @param tab - Tab to send fill message to.
 * */
function tabFind(tab) {
    const { id: tabId, url } = tab;
    const needle = urlToNeedle(url);
    console.log('Searching for results on', url);
    return StoredSafe_1.actions.tabFind(tabId, needle).then((tabResults) => {
        console.log('Found ', [...tabResults.get(tabId).values()].reduce((acc, res) => acc + res.length, 0), 'results on ', url);
        Settings_1.actions.fetch().then((settings) => {
            if (settings.get('autoFill').value) {
                fill(tabId, tabResults.get(tabId));
            }
        });
    });
}
/**
 * Copy text to clipboard and clear clipboard after some amount of time.
 * @param value - Value to be copied to clipboard.
 * @param clearTimer - Time to clear clipboard in ms.
 * TODO: Fix clear timer when not focused.
 * */
function copyToClipboard(value, clearTimer = 10e5) {
    console.log('Copy to clipboard.');
    return navigator.clipboard.writeText(value).then(() => {
        setTimeout(() => {
            navigator.clipboard.writeText('');
            console.log('Cleared clipboard.');
        }, clearTimer);
    });
}
////////////////////////////////////////////////////////////
// Event handler functions
/**
 * Update visual online indicators.
 * @param sessions - Currently active sessions.
 * */
function updateOnlineStatus(sessions) {
    if (sessions.size > 0) {
        console.log('Online');
        browser.browserAction.setIcon({ path: "ico/icon.png" });
    }
    else {
        console.log('Offline');
        browser.browserAction.setIcon({ path: "ico/icon-inactive.png" });
    }
}
/**
 * Check validity of all sessions when browser starts up.
 * */
function onStartup() {
    StoredSafe_1.actions.checkAll().then((sessions) => {
        setupTimers(sessions);
        updateOnlineStatus(sessions);
    });
}
/**
 * Handle updates in session storage.
 * @param sessions - currently active sessions.
 * */
function handleSessionsChange(sessions) {
    updateOnlineStatus(sessions);
    for (const timer of sessionTimers.values()) {
        clearTimeout(timer);
    }
    sessionTimers = new Map();
    setupTimers(sessions);
}
/**
 * Handle changes in storage.
 * @param storage - Storage change object.
 * @param area - Storage area where the change occured.
 * */
function onStorageChange(storage, area) {
    // Local area storage
    if (area === 'local') {
        const { sessions } = storage;
        // If there are changes to sessions
        if (sessions && sessions.newValue) {
            handleSessionsChange(new Map(sessions.newValue));
        }
    }
}
/**
 * Create context menu to be displayed when right-clicking inside an input element.
 * */
function createContextMenu() {
    browser.contextMenus.create({
        id: 'open-popup',
        title: 'Show StoredSafe',
        contexts: ['editable'],
    });
}
/**
 * Handle on install event.
 * In chrome, context menus need to be setup on install.
 * */
function onInstalled({ reason }) {
    createContextMenu();
    // Run online status initialization logic
    Sessions_1.actions.fetch().then((sessions) => updateOnlineStatus(sessions));
    // Open options page if it's a first install or the extension has been updated
    if (reason === 'install' || reason === 'update') {
        browser.runtime.openOptionsPage();
    }
}
/**
 * Clear timeout function for idle timer.
 * */
function clearIdleTimer() {
    console.log('Idle timer cancelled.');
    window.clearTimeout(idleTimer);
}
/**
 * Set up timer to invalidate all sessions after being idle for some time.
 * */
function setupIdleTimer() {
    Settings_1.actions.fetch().then((settings) => {
        // Clear old timer if one exists.
        if (idleTimer) {
            clearIdleTimer();
        }
        const idleTimeout = settings.get('idleMax').value * 6e5;
        console.log('Idle timeout in', idleTimeout, 'ms');
        idleTimer = window.setTimeout(() => {
            console.log('Idle timer expired, invalidate all sessions.');
            invalidateAllSessions();
        }, idleTimeout);
    });
}
/**
 * Handle changes in idle state to lock sessions after some time.
 * @param state - New browser state.
 * */
function onIdle(state) {
    if (state === 'idle') {
        setupIdleTimer();
    }
    else if (state === 'active') {
        if (idleTimer) {
            clearIdleTimer();
        }
    }
}
/**
 * Open extension popup, silence error if popup is already open.
 * */
function openPopup() {
    return browser.browserAction.openPopup().then().catch((error) => {
        console.log(error);
    });
}
/**
 * Handle click events in context menu.
 * */
function onMenuClick(info) {
    switch (info.menuItemId) {
        case 'open-popup': {
            openPopup();
            break;
        }
        default: {
            break;
        }
    }
}
/**
 * Mapped responses to message types.
 * */
const messageHandlers = {
    tabSearch: (data, sender) => (tabFind(sender.tab)),
    copyToClipboard: (value) => (copyToClipboard(value)),
    submit: (values, { tab }) => {
        const { url, id } = tab;
        return TabResults_1.actions.fetch().then((tabResults) => {
            for (const results of tabResults.get(id).values()) {
                for (const result of results) {
                    for (const { value } of result.fields) {
                        console.log('Checking', value, 'in', result, 'against', urlToNeedle(url));
                        if (value.match(urlToNeedle(url))) {
                            console.log('Matching result already exists for', url, ', skip save');
                            return;
                        }
                    }
                }
            }
            const sendSaveMessage = () => {
                values = Object.assign({ name: urlToNeedle(url), url }, values);
                console.log('Sending values to popup', values);
                return browser.runtime.sendMessage({
                    type: 'save',
                    data: values,
                });
            };
            try {
                console.log('Trying to open popup');
                return browser.browserAction.openPopup().then(sendSaveMessage);
            }
            catch (error) {
                console.log(error);
                return sendSaveMessage();
            }
        });
    },
};
/**
 * Handle messages received from other scripts.
 * */
function onMessage(message, sender) {
    const handler = messageHandlers[message.type];
    if (handler) {
        return handler(message.data, sender);
    }
    Promise.reject(`Invalid message type: ${message.type}`);
}
////////////////////////////////////////////////////////////
// Subscribe to events and initialization
// TODO: Remove debug pritnout
console.log('Background script initialized: ', new Date(Date.now()));
// Listen to changes in storage to know when sessions are updated
browser.storage.onChanged.addListener(onStorageChange);
// Handle startup logic, check status of existing sessions.
browser.runtime.onStartup.addListener(onStartup);
// Open options page and set up context menus
browser.runtime.onInstalled.addListener(onInstalled);
// Invalidate sessions after being idle for some time
browser.idle.onStateChanged.addListener(onIdle);
// React to contect menu click (menu set up during onInstall)
browser.contextMenus.onClicked.addListener(onMenuClick);
// React to messages from other parts of the extension
browser.runtime.onMessage.addListener(onMessage);
// Keep StoredSafe session alive or invalidate dead sessions.
setupKeepAlive();


/***/ })

/******/ });
//# sourceMappingURL=background.js.map