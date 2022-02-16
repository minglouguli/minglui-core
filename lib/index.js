(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("MlCore", [], factory);
	else if(typeof exports === 'object')
		exports["MlCore"] = factory();
	else
		root["MlCore"] = factory();
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 669:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(609);

/***/ }),

/***/ 448:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);
var settle = __webpack_require__(26);
var cookies = __webpack_require__(372);
var buildURL = __webpack_require__(327);
var buildFullPath = __webpack_require__(97);
var parseHeaders = __webpack_require__(109);
var isURLSameOrigin = __webpack_require__(985);
var createError = __webpack_require__(61);
var defaults = __webpack_require__(655);
var Cancel = __webpack_require__(263);

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
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
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

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
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || defaults.transitional;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
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
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ 609:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);
var bind = __webpack_require__(849);
var Axios = __webpack_require__(321);
var mergeConfig = __webpack_require__(185);
var defaults = __webpack_require__(655);

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

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(263);
axios.CancelToken = __webpack_require__(972);
axios.isCancel = __webpack_require__(502);
axios.VERSION = (__webpack_require__(288).version);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(713);

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(268);

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports["default"] = axios;


/***/ }),

/***/ 263:
/***/ ((module) => {

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

/***/ 972:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(263);

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

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

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
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
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

/***/ 502:
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ 321:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);
var buildURL = __webpack_require__(327);
var InterceptorManager = __webpack_require__(782);
var dispatchRequest = __webpack_require__(572);
var mergeConfig = __webpack_require__(185);
var validator = __webpack_require__(875);

var validators = validator.validators;
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
Axios.prototype.request = function request(configOrUrl, config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof configOrUrl === 'string') {
    config = config || {};
    config.url = configOrUrl;
  } else {
    config = configOrUrl || {};
  }

  if (!config.url) {
    throw new Error('Provided config url is not valid');
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

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  if (!config.url) {
    throw new Error('Provided config url is not valid');
  }
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ 782:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

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
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
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

/***/ 97:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(793);
var combineURLs = __webpack_require__(303);

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

/***/ 61:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(481);

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

/***/ 572:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);
var transformData = __webpack_require__(527);
var isCancel = __webpack_require__(502);
var defaults = __webpack_require__(655);
var Cancel = __webpack_require__(263);

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
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
  config.data = transformData.call(
    config,
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
    response.data = transformData.call(
      config,
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
        reason.response.data = transformData.call(
          config,
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

/***/ 481:
/***/ ((module) => {

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

  error.toJSON = function toJSON() {
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
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};


/***/ }),

/***/ 185:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

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

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


/***/ }),

/***/ 26:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(61);

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
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

/***/ 527:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);
var defaults = __webpack_require__(655);

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


/***/ }),

/***/ 655:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);
var normalizeHeaderName = __webpack_require__(16);
var enhanceError = __webpack_require__(481);

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
    adapter = __webpack_require__(448);
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(448);
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

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
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
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
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ 288:
/***/ ((module) => {

module.exports = {
  "version": "0.25.0"
};

/***/ }),

/***/ 849:
/***/ ((module) => {

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

/***/ 327:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

function encode(val) {
  return encodeURIComponent(val).
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

/***/ 303:
/***/ ((module) => {

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

/***/ 372:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

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

/***/ 793:
/***/ ((module) => {

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
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ 268:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return utils.isObject(payload) && (payload.isAxiosError === true);
};


/***/ }),

/***/ 985:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

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

/***/ 16:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ 109:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(867);

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

/***/ 713:
/***/ ((module) => {

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

/***/ 875:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var VERSION = (__webpack_require__(288).version);

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


/***/ }),

/***/ 867:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(849);

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return Array.isArray(val);
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
  return toString.call(val) === '[object FormData]';
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
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
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
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
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
  return toString.call(val) === '[object URLSearchParams]';
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
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
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
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

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
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
  isPlainObject: isPlainObject,
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
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ 152:
/***/ (function(module) {

/*!
 * clipboard.js v2.0.10
 * https://clipboardjs.com/
 *
 * Licensed MIT © Zeno Rocha
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else {}
})(this, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 686:
/***/ (function(__unused_webpack_module, __webpack_exports__, __nested_webpack_require_623__) {

"use strict";

// EXPORTS
__nested_webpack_require_623__.d(__webpack_exports__, {
  "default": function() { return /* binding */ clipboard; }
});

// EXTERNAL MODULE: ./node_modules/tiny-emitter/index.js
var tiny_emitter = __nested_webpack_require_623__(279);
var tiny_emitter_default = /*#__PURE__*/__nested_webpack_require_623__.n(tiny_emitter);
// EXTERNAL MODULE: ./node_modules/good-listener/src/listen.js
var listen = __nested_webpack_require_623__(370);
var listen_default = /*#__PURE__*/__nested_webpack_require_623__.n(listen);
// EXTERNAL MODULE: ./node_modules/select/src/select.js
var src_select = __nested_webpack_require_623__(817);
var select_default = /*#__PURE__*/__nested_webpack_require_623__.n(src_select);
;// CONCATENATED MODULE: ./src/common/command.js
/**
 * Executes a given operation type.
 * @param {String} type
 * @return {Boolean}
 */
function command(type) {
  try {
    return document.execCommand(type);
  } catch (err) {
    return false;
  }
}
;// CONCATENATED MODULE: ./src/actions/cut.js


/**
 * Cut action wrapper.
 * @param {String|HTMLElement} target
 * @return {String}
 */

var ClipboardActionCut = function ClipboardActionCut(target) {
  var selectedText = select_default()(target);
  command('cut');
  return selectedText;
};

/* harmony default export */ var actions_cut = (ClipboardActionCut);
;// CONCATENATED MODULE: ./src/common/create-fake-element.js
/**
 * Creates a fake textarea element with a value.
 * @param {String} value
 * @return {HTMLElement}
 */
function createFakeElement(value) {
  var isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  var fakeElement = document.createElement('textarea'); // Prevent zooming on iOS

  fakeElement.style.fontSize = '12pt'; // Reset box model

  fakeElement.style.border = '0';
  fakeElement.style.padding = '0';
  fakeElement.style.margin = '0'; // Move element out of screen horizontally

  fakeElement.style.position = 'absolute';
  fakeElement.style[isRTL ? 'right' : 'left'] = '-9999px'; // Move element to the same position vertically

  var yPosition = window.pageYOffset || document.documentElement.scrollTop;
  fakeElement.style.top = "".concat(yPosition, "px");
  fakeElement.setAttribute('readonly', '');
  fakeElement.value = value;
  return fakeElement;
}
;// CONCATENATED MODULE: ./src/actions/copy.js



/**
 * Copy action wrapper.
 * @param {String|HTMLElement} target
 * @param {Object} options
 * @return {String}
 */

var ClipboardActionCopy = function ClipboardActionCopy(target) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    container: document.body
  };
  var selectedText = '';

  if (typeof target === 'string') {
    var fakeElement = createFakeElement(target);
    options.container.appendChild(fakeElement);
    selectedText = select_default()(fakeElement);
    command('copy');
    fakeElement.remove();
  } else {
    selectedText = select_default()(target);
    command('copy');
  }

  return selectedText;
};

/* harmony default export */ var actions_copy = (ClipboardActionCopy);
;// CONCATENATED MODULE: ./src/actions/default.js
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }



/**
 * Inner function which performs selection from either `text` or `target`
 * properties and then executes copy or cut operations.
 * @param {Object} options
 */

var ClipboardActionDefault = function ClipboardActionDefault() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  // Defines base properties passed from constructor.
  var _options$action = options.action,
      action = _options$action === void 0 ? 'copy' : _options$action,
      container = options.container,
      target = options.target,
      text = options.text; // Sets the `action` to be performed which can be either 'copy' or 'cut'.

  if (action !== 'copy' && action !== 'cut') {
    throw new Error('Invalid "action" value, use either "copy" or "cut"');
  } // Sets the `target` property using an element that will be have its content copied.


  if (target !== undefined) {
    if (target && _typeof(target) === 'object' && target.nodeType === 1) {
      if (action === 'copy' && target.hasAttribute('disabled')) {
        throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
      }

      if (action === 'cut' && (target.hasAttribute('readonly') || target.hasAttribute('disabled'))) {
        throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
      }
    } else {
      throw new Error('Invalid "target" value, use a valid Element');
    }
  } // Define selection strategy based on `text` property.


  if (text) {
    return actions_copy(text, {
      container: container
    });
  } // Defines which selection strategy based on `target` property.


  if (target) {
    return action === 'cut' ? actions_cut(target) : actions_copy(target, {
      container: container
    });
  }
};

/* harmony default export */ var actions_default = (ClipboardActionDefault);
;// CONCATENATED MODULE: ./src/clipboard.js
function clipboard_typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { clipboard_typeof = function _typeof(obj) { return typeof obj; }; } else { clipboard_typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return clipboard_typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (clipboard_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }






/**
 * Helper function to retrieve attribute value.
 * @param {String} suffix
 * @param {Element} element
 */

function getAttributeValue(suffix, element) {
  var attribute = "data-clipboard-".concat(suffix);

  if (!element.hasAttribute(attribute)) {
    return;
  }

  return element.getAttribute(attribute);
}
/**
 * Base class which takes one or more elements, adds event listeners to them,
 * and instantiates a new `ClipboardAction` on each click.
 */


var Clipboard = /*#__PURE__*/function (_Emitter) {
  _inherits(Clipboard, _Emitter);

  var _super = _createSuper(Clipboard);

  /**
   * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
   * @param {Object} options
   */
  function Clipboard(trigger, options) {
    var _this;

    _classCallCheck(this, Clipboard);

    _this = _super.call(this);

    _this.resolveOptions(options);

    _this.listenClick(trigger);

    return _this;
  }
  /**
   * Defines if attributes would be resolved using internal setter functions
   * or custom functions that were passed in the constructor.
   * @param {Object} options
   */


  _createClass(Clipboard, [{
    key: "resolveOptions",
    value: function resolveOptions() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
      this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
      this.text = typeof options.text === 'function' ? options.text : this.defaultText;
      this.container = clipboard_typeof(options.container) === 'object' ? options.container : document.body;
    }
    /**
     * Adds a click event listener to the passed trigger.
     * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
     */

  }, {
    key: "listenClick",
    value: function listenClick(trigger) {
      var _this2 = this;

      this.listener = listen_default()(trigger, 'click', function (e) {
        return _this2.onClick(e);
      });
    }
    /**
     * Defines a new `ClipboardAction` on each click event.
     * @param {Event} e
     */

  }, {
    key: "onClick",
    value: function onClick(e) {
      var trigger = e.delegateTarget || e.currentTarget;
      var action = this.action(trigger) || 'copy';
      var text = actions_default({
        action: action,
        container: this.container,
        target: this.target(trigger),
        text: this.text(trigger)
      }); // Fires an event based on the copy operation result.

      this.emit(text ? 'success' : 'error', {
        action: action,
        text: text,
        trigger: trigger,
        clearSelection: function clearSelection() {
          if (trigger) {
            trigger.focus();
          }

          document.activeElement.blur();
          window.getSelection().removeAllRanges();
        }
      });
    }
    /**
     * Default `action` lookup function.
     * @param {Element} trigger
     */

  }, {
    key: "defaultAction",
    value: function defaultAction(trigger) {
      return getAttributeValue('action', trigger);
    }
    /**
     * Default `target` lookup function.
     * @param {Element} trigger
     */

  }, {
    key: "defaultTarget",
    value: function defaultTarget(trigger) {
      var selector = getAttributeValue('target', trigger);

      if (selector) {
        return document.querySelector(selector);
      }
    }
    /**
     * Allow fire programmatically a copy action
     * @param {String|HTMLElement} target
     * @param {Object} options
     * @returns Text copied.
     */

  }, {
    key: "defaultText",

    /**
     * Default `text` lookup function.
     * @param {Element} trigger
     */
    value: function defaultText(trigger) {
      return getAttributeValue('text', trigger);
    }
    /**
     * Destroy lifecycle.
     */

  }, {
    key: "destroy",
    value: function destroy() {
      this.listener.destroy();
    }
  }], [{
    key: "copy",
    value: function copy(target) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        container: document.body
      };
      return actions_copy(target, options);
    }
    /**
     * Allow fire programmatically a cut action
     * @param {String|HTMLElement} target
     * @returns Text cutted.
     */

  }, {
    key: "cut",
    value: function cut(target) {
      return actions_cut(target);
    }
    /**
     * Returns the support of the given action, or all actions if no action is
     * given.
     * @param {String} [action]
     */

  }, {
    key: "isSupported",
    value: function isSupported() {
      var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['copy', 'cut'];
      var actions = typeof action === 'string' ? [action] : action;
      var support = !!document.queryCommandSupported;
      actions.forEach(function (action) {
        support = support && !!document.queryCommandSupported(action);
      });
      return support;
    }
  }]);

  return Clipboard;
}((tiny_emitter_default()));

/* harmony default export */ var clipboard = (Clipboard);

/***/ }),

/***/ 828:
/***/ (function(module) {

var DOCUMENT_NODE_TYPE = 9;

/**
 * A polyfill for Element.matches()
 */
if (typeof Element !== 'undefined' && !Element.prototype.matches) {
    var proto = Element.prototype;

    proto.matches = proto.matchesSelector ||
                    proto.mozMatchesSelector ||
                    proto.msMatchesSelector ||
                    proto.oMatchesSelector ||
                    proto.webkitMatchesSelector;
}

/**
 * Finds the closest parent that matches a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Function}
 */
function closest (element, selector) {
    while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
        if (typeof element.matches === 'function' &&
            element.matches(selector)) {
          return element;
        }
        element = element.parentNode;
    }
}

module.exports = closest;


/***/ }),

/***/ 438:
/***/ (function(module, __unused_webpack_exports, __nested_webpack_require_15133__) {

var closest = __nested_webpack_require_15133__(828);

/**
 * Delegates event to a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function _delegate(element, selector, type, callback, useCapture) {
    var listenerFn = listener.apply(this, arguments);

    element.addEventListener(type, listenerFn, useCapture);

    return {
        destroy: function() {
            element.removeEventListener(type, listenerFn, useCapture);
        }
    }
}

/**
 * Delegates event to a selector.
 *
 * @param {Element|String|Array} [elements]
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function delegate(elements, selector, type, callback, useCapture) {
    // Handle the regular Element usage
    if (typeof elements.addEventListener === 'function') {
        return _delegate.apply(null, arguments);
    }

    // Handle Element-less usage, it defaults to global delegation
    if (typeof type === 'function') {
        // Use `document` as the first parameter, then apply arguments
        // This is a short way to .unshift `arguments` without running into deoptimizations
        return _delegate.bind(null, document).apply(null, arguments);
    }

    // Handle Selector-based usage
    if (typeof elements === 'string') {
        elements = document.querySelectorAll(elements);
    }

    // Handle Array-like based usage
    return Array.prototype.map.call(elements, function (element) {
        return _delegate(element, selector, type, callback, useCapture);
    });
}

/**
 * Finds closest match and invokes callback.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Function}
 */
function listener(element, selector, type, callback) {
    return function(e) {
        e.delegateTarget = closest(e.target, selector);

        if (e.delegateTarget) {
            callback.call(element, e);
        }
    }
}

module.exports = delegate;


/***/ }),

/***/ 879:
/***/ (function(__unused_webpack_module, exports) {

/**
 * Check if argument is a HTML element.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.node = function(value) {
    return value !== undefined
        && value instanceof HTMLElement
        && value.nodeType === 1;
};

/**
 * Check if argument is a list of HTML elements.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.nodeList = function(value) {
    var type = Object.prototype.toString.call(value);

    return value !== undefined
        && (type === '[object NodeList]' || type === '[object HTMLCollection]')
        && ('length' in value)
        && (value.length === 0 || exports.node(value[0]));
};

/**
 * Check if argument is a string.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.string = function(value) {
    return typeof value === 'string'
        || value instanceof String;
};

/**
 * Check if argument is a function.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.fn = function(value) {
    var type = Object.prototype.toString.call(value);

    return type === '[object Function]';
};


/***/ }),

/***/ 370:
/***/ (function(module, __unused_webpack_exports, __nested_webpack_require_18497__) {

var is = __nested_webpack_require_18497__(879);
var delegate = __nested_webpack_require_18497__(438);

/**
 * Validates all params and calls the right
 * listener function based on its target type.
 *
 * @param {String|HTMLElement|HTMLCollection|NodeList} target
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listen(target, type, callback) {
    if (!target && !type && !callback) {
        throw new Error('Missing required arguments');
    }

    if (!is.string(type)) {
        throw new TypeError('Second argument must be a String');
    }

    if (!is.fn(callback)) {
        throw new TypeError('Third argument must be a Function');
    }

    if (is.node(target)) {
        return listenNode(target, type, callback);
    }
    else if (is.nodeList(target)) {
        return listenNodeList(target, type, callback);
    }
    else if (is.string(target)) {
        return listenSelector(target, type, callback);
    }
    else {
        throw new TypeError('First argument must be a String, HTMLElement, HTMLCollection, or NodeList');
    }
}

/**
 * Adds an event listener to a HTML element
 * and returns a remove listener function.
 *
 * @param {HTMLElement} node
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNode(node, type, callback) {
    node.addEventListener(type, callback);

    return {
        destroy: function() {
            node.removeEventListener(type, callback);
        }
    }
}

/**
 * Add an event listener to a list of HTML elements
 * and returns a remove listener function.
 *
 * @param {NodeList|HTMLCollection} nodeList
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNodeList(nodeList, type, callback) {
    Array.prototype.forEach.call(nodeList, function(node) {
        node.addEventListener(type, callback);
    });

    return {
        destroy: function() {
            Array.prototype.forEach.call(nodeList, function(node) {
                node.removeEventListener(type, callback);
            });
        }
    }
}

/**
 * Add an event listener to a selector
 * and returns a remove listener function.
 *
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenSelector(selector, type, callback) {
    return delegate(document.body, selector, type, callback);
}

module.exports = listen;


/***/ }),

/***/ 817:
/***/ (function(module) {

function select(element) {
    var selectedText;

    if (element.nodeName === 'SELECT') {
        element.focus();

        selectedText = element.value;
    }
    else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
        var isReadOnly = element.hasAttribute('readonly');

        if (!isReadOnly) {
            element.setAttribute('readonly', '');
        }

        element.select();
        element.setSelectionRange(0, element.value.length);

        if (!isReadOnly) {
            element.removeAttribute('readonly');
        }

        selectedText = element.value;
    }
    else {
        if (element.hasAttribute('contenteditable')) {
            element.focus();
        }

        var selection = window.getSelection();
        var range = document.createRange();

        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);

        selectedText = selection.toString();
    }

    return selectedText;
}

module.exports = select;


/***/ }),

/***/ 279:
/***/ (function(module) {

function E () {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
  on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    };

    listener._ = callback
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

module.exports = E;
module.exports.TinyEmitter = E;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nested_webpack_require_23879__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nested_webpack_require_23879__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__nested_webpack_require_23879__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__nested_webpack_require_23879__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__nested_webpack_require_23879__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__nested_webpack_require_23879__.o(definition, key) && !__nested_webpack_require_23879__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__nested_webpack_require_23879__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __nested_webpack_require_23879__(686);
/******/ })()
.default;
});

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "MlApp": () => (/* reexport */ mlapp_mlapp),
  "MlCore": () => (/* reexport */ mingl_core),
  "default": () => (/* binding */ src)
});

;// CONCATENATED MODULE: ./src/extension/jsExtension.js
//Array
Array.prototype.any = function (fun) {
  let _ = this;

  for (let i = 0; i < _.length; i++) {
    const element = _[i];

    if (fun(element)) {
      return true;
    }
  }

  return false;
};

Array.prototype.remove = function (fun) {
  let index = 0;

  while (index < this.length) {
    const item = this[index];

    if (fun(item)) {
      this.splice(index, 1);
    } else {
      index++;
    }
  }

  return this; //return this.filter(f => !fun(f));
};

Array.prototype.removeAt = function (i) {
  return this.splice(i, 1);
};

Array.prototype.firstOrDefault = function (fun) {
  return this.filter(fun)[0];
};

Array.prototype.where = function (fun) {
  return this.filter(fun);
};

Array.prototype.select = function (fun) {
  var arr = [];

  var _ = this;

  for (let i = 0; i < _.length; i++) {
    const element1 = _[i];
    arr.push(fun(element1, i));
  }

  return arr;
};

Array.prototype.sum = function (fun) {
  var _ = this;

  let sum = 0;

  if (fun == null) {
    for (let i = 0; i < _.length; i++) {
      const element = _[i];
      sum += element;
    }
  } else {
    for (let i = 0; i < _.length; i++) {
      const element = _[i];
      sum += fun(element);
    }
  }

  return sum;
};

Array.prototype.clone = function () {
  let _ = this;

  let arr = [];

  for (let i = 0; i < _.length; i++) {
    const element = _[i];
    arr.push(element);
  }

  return arr;
};

Array.prototype.sortAsc = function (fun) {
  return this.sort((a, b) => fun(a) - fun(b));
};

Array.prototype.sortDesc = function (fun) {
  return this.sort((a, b) => fun(b) - fun(a));
};

Array.prototype.orderBy = function (fun) {
  let _ = this;

  let length = _.length;

  for (let j = 0; j < length; j++) {
    let end = length - j;

    for (let i = 0; i < end; i++) {
      const element = _[i];

      if (i < end - 1) {
        const next = _[i + 1];

        if (fun(element) - fun(next) > 0) {
          _[i + 1] = element;
          _[i] = next;
        }
      }
    }
  }
};

Array.prototype.orderByDescending = function (fun) {
  let _ = this;

  let length = _.length;

  for (let j = 0; j < length; j++) {
    let end = length - j;

    for (let i = 0; i < end; i++) {
      const element = _[i];

      if (i < end - 1) {
        const next = _[i + 1];

        if (fun(element) - fun(next) < 0) {
          _[i + 1] = element;
          _[i] = next;
        }
      }
    }
  }

  return this;
};

Array.prototype.orderBy2 = function (fun) {
  let _ = this;

  let length = _.length;

  for (let j = 0; j < length; j++) {
    let end = length - j;

    for (let i = 0; i < end; i++) {
      const element = _[i];

      if (i < end - 1) {
        const next = _[i + 1];

        if (fun(element) - fun(next) > 0) {
          _[i + 1] = element;
          _[i] = next;
        }
      }
    }
  }

  return this;
};

Array.prototype.orderByDescending2 = function (fun) {
  let _ = this;

  let length = _.length;

  for (let j = 0; j < length; j++) {
    let end = length - j;

    for (let i = 0; i < end; i++) {
      const element = _[i];

      if (i < end - 1) {
        const next = _[i + 1];

        if (fun(element) - fun(next) < 0) {
          _[i + 1] = element;
          _[i] = next;
        }
      }
    }
  }

  return this;
};

Array.prototype.addRange = function (list) {
  let _ = this;

  for (let index = 0; index < list.length; index++) {
    const element = list[index];

    _.push(element);
  }

  return _;
}; //Data


Date.prototype.format = function (format) {
  format = format || 'yyyy-MM-dd HH:mm:ss';
  var o = {
    'M+': this.getMonth() + 1,
    //month
    'd+': this.getDate(),
    //day
    'H+': this.getHours(),
    //hour
    'm+': this.getMinutes(),
    //minute
    's+': this.getSeconds(),
    //second
    'q+': Math.floor((this.getMonth() + 3) / 3),
    //quarter
    S: this.getMilliseconds() //millisecond

  };

  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
  }

  for (var k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
    }
  }

  return format;
}; //String


String.prototype.dateFormat = function (format) {
  let value = this;

  if (!value) {
    return '';
  } else {
    if (value.indexOf('Date') > -1) {
      var inx = value.match(/(-\d+|\d+)/)[1];
      return new Date(parseInt(inx)).format(format);
    } else {
      if (value.indexOf('T') == -1) {
        value = value.replace(/-/g, '/');
      } // return $dayjs(value).format('YYYY-MM-DD');
      //console.log(value);


      return new Date(value).format(format);
    }
  }
};

String.prototype.format = function () {
  // af{0}cd{1}er{2}sdf
  let format = this;
  var param = arguments;
  var obj = param[0];

  if (obj) {
    if (obj && typeof obj == 'object') {
      if (/\{[a-zA-Z]+\}/gi.test(format)) {
        // var m = objectTool.SearchOfRoute(mo, full, true);
        format = format.replace(/\{[a-zA-Z]+\}/gi, function (val) {
          var i = val.match(/{([a-zA-Z]+)}/)[1];
          return obj[i];
        });
      }

      return format;
    } else {
      return format.replace(/\{\d+\}/gi, function (val) {
        var i = parseInt(val.match(/{(\d+)}/)[1]);
        return param[i];
      });
    }
  }

  return format;
};

String.prototype.toDate = function () {
  let value = this;

  if (!value) {
    return new Date();
  } else {
    if (value.indexOf('Date') > -1) {
      var inx = value.match(/(-\d+|\d+)/)[1];
      return new Date(parseInt(inx));
    } else {
      return new Date(value);
    }
  }
};

String.prototype.mgSubstring = function (start, length, format) {
  let _ = this;

  if (_ == undefined) {
    return '';
  }

  let len = this.length;
  return _.substring(start, start + length) + (len - start > length ? format || '' : '');
};

String.prototype.nameCase = function (to, from) {
  // 1:cameCase;  2:PascalCase;   3:kebabCase;  4:mid-line
  let name = this;

  if (to != 4 && name.indexOf('-') > -1) {
    name = name.replace(/-/gi, '_');
  }

  if (to == 1) {
    if (name.indexOf('_') > -1) {
      console.log(name, to); // my_name>myName

      let vr = name.replace(/_(\w)/g, function (all, letter) {
        return letter.toUpperCase();
      });
      console.log(vr);
      return vr;
    } else {
      //MyName > myName
      return name.charAt(0).toLowerCase() + name.substring(1);
    }
  } else if (to == 2) {
    if (name.indexOf('_') > -1) {
      let tn = name.replace(/_(\w)/g, function (all, letter) {
        return letter.toUpperCase();
      });
      return tn.charAt(0).toUpperCase() + tn.substring(1);
    } else {
      //myName > MyName
      return name.charAt(0).toUpperCase() + name.substring(1);
    }
  } else if (to == 3) {
    if (/[A-Z]/.test(name.charAt(0))) {
      //  MyName > my_name;
      return (name.charAt(0).toLowerCase() + name.substring(1)).replace(/([A-Z])/g, '_$1').toLowerCase();
    } else {
      //  myName > my_name;
      return name.replace(/([A-Z])/g, '_$1').toLowerCase();
    }
  } else if (to == 4) {
    if (/[A-Z]/.test(name.charAt(0))) {
      //  MyName > my_name;
      return (name.charAt(0).toLowerCase() + name.substring(1)).replace(/([A-Z])/g, '-$1').toLowerCase();
    } else {
      //  myName > my_name;
      return name.replace(/([A-Z])/g, '-$1').toLowerCase();
    }
  }

  return name;
}; //Math


Math.mlRound = function (v, l) {
  if (l) {
    return Math.round(v * l * 10) / (l * 10);
  } else {
    return Math.round(v);
  }
};

/* harmony default export */ function jsExtension() {}
;// CONCATENATED MODULE: ./src/mlapp/mlr.js
class MlR {
  mlREngine = null;
  $filters = {};
  $options = {};

  constructor(opt) {
    this.$options = Object.assign({}, MlR.__global__.options, this.$options, opt || {});
    this.$filters = Object.assign({}, MlR.__global__.filters, this.$filters);
    this.mlREngine = new MlREngine(this, {
      options: this.$options,
      filters: this.$filters
    });
  }

  filter(filterName, handler) {
    this.$filters[filterName] = handler;
    return this;
  }

  render(template, data) {
    return this.mlREngine.render(template, data);
  }

}

MlR.__global__ = {
  filters: {},
  options: {
    openTag: '{{',
    closeTag: '}}'
  }
};

MlR.filter = function (filterName, handler) {
  MlR.__global__.filters[filterName] = handler;
};

MlR.new = function (options) {
  return new MlR(options);
};

class MlREngine {
  #options = {
    openTag: '{{',
    closeTag: '}}'
  };
  #filters = {};
  #mlr = null;

  constructor(mlr, config) {
    this.#mlr = mlr;
    this.#options = config.options;
    this.#filters = config.filters;
  }

  render(template, data) {
    //   asdfbc{{name}}uuuuu{{abccc{{todod}}
    let result = '';

    if (!template) {
      return result;
    }

    let scopeData = data || {};
    template.split(this.#options.openTag).forEach((value, index) => {
      if (index > 0) {
        let vtemp = value.split(this.#options.closeTag);
        let v0 = vtemp[0]; //name

        let v1 = vtemp[1]; //uuuuu

        if (vtemp.length == 1) {
          result += this.textAnalysis(v0);
        } else {
          result += this.expressionAnalysis(v0, scopeData);

          if (v1) {
            result += this.textAnalysis(v1);
          }
        }
      } else {
        result += value;
      }
    });
    return result;
  }

  textAnalysis(text) {
    return text;
  }

  bindKeyExpressionAnalysis(bindKeyExpression, data) {
    // console.log(bindKeyExpression);
    bindKeyExpression = bindKeyExpression.trim();
    let tNumber = Number(bindKeyExpression);

    if (!isNaN(tNumber)) {
      //数字
      return tNumber;
    } else if (bindKeyExpression[0] == '"' && bindKeyExpression[bindKeyExpression.length - 1] == "'" || bindKeyExpression[0] == "'" && bindKeyExpression[bindKeyExpression.length - 1] == "'") {
      //纯字符串
      return bindKeyExpression;
    } else {
      let bindKey = bindKeyExpression;
      let bindValue = '';

      if (Object.hasOwnProperty.call(data, bindKey)) {
        bindValue = data[bindKey];
      }

      return bindValue;
    }
  }

  filterExpressionAnalysis(filterExpression) {
    let result = [];

    if (filterExpression.indexOf('(') > 0) {
      //存在参数
      result[0] = filterExpression.match(/([\w]+)\(/)[1];
      result[1] = [];
      var paramExpression = filterExpression.match(/[\w]+\(([^)]+)\)/)[1];

      if (paramExpression) {
        result[1] = paramExpression.split(',');
      }
    } else {
      result[0] = filterExpression;
      result[1] = []; //无参数
    }

    return result;
  }

  getFilter(filterName) {
    if (Object.hasOwnProperty.call(this.#filters, filterName)) {
      return this.#filters[filterName];
    } else {
      return null;
    }
  }

  expressionAnalysis(expression, data) {
    let varr = expression.split('|');
    let bindValue = '';
    let bindKeyExpression = varr[0]; // debugger;

    if (bindKeyExpression) {
      bindValue = this.bindKeyExpressionAnalysis(bindKeyExpression, data);

      if (varr.length > 1) {
        //存在过滤器
        for (let i = 1; i < varr.length; i++) {
          const filterExpression = varr[i];

          if (filterExpression) {
            var filterResult = this.filterExpressionAnalysis(filterExpression);
            let filterName = filterResult[0];
            let filter = this.getFilter(filterName);

            if (filter) {
              let params = [bindValue];
              let filterParamsReslut = filterResult[1];

              if (filterParamsReslut.length > 0) {
                for (let j = 0; j < filterParamsReslut.length; j++) {
                  params.push(this.bindKeyExpressionAnalysis(filterParamsReslut[j], data));
                }
              }

              bindValue = filter.apply(this.#mlr, params);
            } else {
              console.warn('未定义过滤器：' + filterName);
            }
          }
        }

        return bindValue;
      } else {
        return bindValue;
      }
    } else {
      return bindValue;
    }
  }

}

/* harmony default export */ const mlr = (MlR);
;// CONCATENATED MODULE: ./src/mlapp/mlapp.js


class MlApp {
  #privateCache = {};
  #hash = {};
  #privateEvents = {};
  #pluginsConfig = {};
  #lockQueue = {};
  #stackQueue = {};
  #global = {}; //属性

  config = {
    enableLog: true
  };
  env = {
    device: '',
    //pc  mobile
    platForm: '',
    //web  h5  app  wechat min  desktop
    os: '',
    //win10 android  ios
    isDev: true
  };

  constructor(global) {
    if (!global) {
      global = typeof window != 'undefined' ? window : global;
    }

    this.setGlobal(global);
  } //======基本方法


  log(...arg) {
    console.log(...arg);
  }

  token(pre, str, len) {
    var token = ''; //订单号

    for (var i = 0; i < 6; i++) {
      ////6位随机数，用以加在时间戳后面。
      token += Math.floor(Math.random() * 10);
    }

    var tstr = new Date().getTime() + '';

    if (len) {
      tstr = tstr.substr(4, 6);
    }

    return (pre || '') + tstr + (str || '') + token;
  }

  setGlobal(global) {
    this.#global = global;
  }

  setConfig(config) {
    this.config = Object.assign({}, this.config, config);
    return this;
  } //配置插件全局配置


  setPluginConfig(pluginName, config) {
    this.#pluginsConfig[pluginName] = config;
  } //获取插件全局配置


  getPluginConfig(pluginName) {
    return this.#pluginsConfig[pluginName] || {};
  }

  setData(key, obj) {
    this.setCache(key, obj);
  }

  getData(key) {
    return this.getCache(key) || {};
  }

  updateData(key, obj) {
    this.setCache(key, Object.assign({}, this.getData(key), obj));
  } //存储


  setCache(key, value, seconds, sleep) {
    this.#privateCache[key] = {
      active: true,
      value: value
    };

    if (seconds) {
      let ti = setTimeout(() => {
        if (Object.hasOwnProperty.call(this.#privateCache, key)) {
          if (sleep) {
            this.#privateCache[key].active = false;
          } else {
            delete this.#privateCache[key];
          }
        }

        clearTimeout(ti);
      }, seconds * 1000);
    }
  }

  getCache(key, useSleep) {
    let obj = this.#privateCache[key];

    if (obj) {
      if (!useSleep && !obj.active) {
        return null;
      } else {
        return obj.value;
      }
    } else {
      return null;
    }
  }

  delCache(key) {
    if (Object.hasOwnProperty.call(this.#privateCache, key)) {
      delete this.#privateCache[key];
    }
  }
  /**
   *保存hash
   *
   * @param {*} key
   * @param {*} field
   * @param {*} value
   * @param {*} seconds 缓存时长，不设置或0表示持久
   * @param {*} sleep 是否启动睡眠模式，是 则缓存过期后变成睡眠状态，而不是清除缓存
   * @memberof MlApp
   */


  setHash(key, field, value, seconds, sleep) {
    if (!this.#hash[key]) {
      this.#hash[key] = {};
    }

    this.#hash[key][field] = {
      active: true,
      value: value
    };

    if (seconds) {
      let ti = setTimeout(() => {
        if (this.#hash[key] && Object.hasOwnProperty.call(this.#hash[key], field)) {
          if (sleep) {
            this.#hash[key][field].active = false;
          } else {
            delete this.#hash[key][field];
          }
        }

        clearTimeout(ti);
      }, seconds * 1000);
    }
  }
  /**
   * 获取hash
   *
   * @param {*} key
   * @param {*} field
   * @param {*} useSleep 如果数据处于睡眠状态，则获取睡眠状态的数据，否则如果没有活跃的数据将返回null
   * @memberof MlApp
   */


  getHash(key, field, useSleep) {
    if (field) {
      if (this.#hash[key]) {
        let hash = this.#hash[key][field];

        if (hash) {
          if (!useSleep && !hash.active) {
            return null;
          } else {
            return hash.value;
          }
        }
      }

      return null;
    } else {
      return this.#hash[key] || null;
    }
  }

  delHash(key, field) {
    if (Object.hasOwnProperty.call(this.#hash, key)) {
      if (field) {
        if (this.#hash[key] && Object.hasOwnProperty.call(this.#hash[key], field)) {
          delete this.#hash[key][field];
        }
      } else {
        delete this.#hash[key];
      }
    }
  }

  setStore(key, value) {
    this.#global.localStorage.setItem(key, value);
  }

  getStore(key) {
    return this.#global.localStorage.getItem(key);
  }

  delStore(key) {
    this.#global.localStorage.removeItem(key);
  }

  async lock(name) {
    if (!this.#lockQueue[name]) {
      this.#lockQueue[name] = {
        queue: [],
        isLock: false
      };
    }
  }

  async queue(name, fun) {
    if (!this.#stackQueue[name]) {
      this.#stackQueue[name] = {
        queue: [],
        using: false
      };
    }

    let obj = this.#stackQueue[name];
    obj.queue.push(fun);
    await this.runQueue(name, obj);
  }

  async runQueue(name, queueObj) {
    if (!queueObj.using) {
      queueObj.using = true;
      let activeFun = queueObj.queue.shift();

      if (activeFun) {
        await activeFun();
        queueObj.using = false;
        this.runQueue(name, queueObj);
      } else {
        //队列走完了
        queueObj.using = false; //释放队列

        delete this.#stackQueue[name];
      }
    }
  }

  setLang(langName, lang) {
    //todo 通过设置加载语言；
    this.setStore('_lang', langName);
    this.setCache('_lang', lang);
  }

  getLang() {
    //todo 通过设置加载语言；
    return this.getCache('_lang');
  } //====事件


  on(eventName, fun) {
    eventName = 'ml-' + eventName;

    if (!this.#privateEvents[eventName]) {
      this.#privateEvents[eventName] = [];
    }

    this.#privateEvents[eventName].push(fun);
  }

  off(eventName) {
    eventName = 'ml-' + eventName;
    this.#privateEvents[eventName] = [];
  }

  trigger(eventName, eventoptions) {
    eventName = 'ml-' + eventName;
    let events = this.#privateEvents[eventName] || [];

    if (events.length > 0) {
      for (let i = 0; i < events.length; i++) {
        const e = events[i];
        e(eventoptions);
      }
    }
  } //其他方法


  objToList(obj, fun) {
    let list = [];

    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const element = obj[key];
        list.push(fun(key, element));
      }
    }
  }

  listToDic(list, key, value) {
    key = key || 'key';
    value = value || 'value';
    let length = list.length;
    let dic = {};

    for (let i = 0; i < length; i++) {
      let item = list[i];
      dic[item[key]] = item[value];
    }

    return dic || {};
  }

  getQueryString = function (name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = this.#global.location.search.substr(1).match(reg);

    if (r !== null) {
      return unescape(r[2]);
    }

    return null;
  };

  MlR() {
    return mlr;
  }

}

MlApp.use = function (plugin, ...args) {
  plugin.install && plugin.install(MlApp, ...args);
};

/* harmony default export */ const mlapp_mlapp = (MlApp);
// EXTERNAL MODULE: ./node_modules/clipboard/dist/clipboard.js
var dist_clipboard = __webpack_require__(152);
var clipboard_default = /*#__PURE__*/__webpack_require__.n(dist_clipboard);
;// CONCATENATED MODULE: ./src/extension/mlappExtension.js


class MlExtension {
  install(MlApp) {
    MlApp.prototype.join = function (objArr, pro, separator) {
      var r = '';

      for (var i = 0; i < objArr.length; i++) {
        r += (objArr[i][pro] || '') + separator;
      }

      return r;
    };

    MlApp.prototype.ArrAcross = function (arr1, fun) {
      var arr = [];

      for (let i = 0; i < arr1.length; i++) {
        const element1 = arr1[i];
        arr.push(fun(element1));
      }

      return arr;
    };

    MlApp.prototype.ArrAcross2 = function (arr1, arr2, fun) {
      var arr = [];

      for (let i = 0; i < arr1.length; i++) {
        const element1 = arr1[i];

        for (let ii = 0; ii < arr2.length; ii++) {
          const element2 = arr2[ii];
          arr.push(fun(element1, element2));
        }
      }

      return arr;
    };

    MlApp.prototype.ArrAcross3 = function (arr1, arr2, arr3, fun) {
      var arr = [];

      for (let i = 0; i < arr1.length; i++) {
        const element1 = arr1[i];

        for (let ii = 0; ii < arr2.length; ii++) {
          const element2 = arr2[ii];

          for (let iii = 0; iii < arr3.length; iii++) {
            const element3 = arr3[iii];
            arr.push(fun(element1, element2, element3));
          }
        }
      }

      return arr;
    };

    MlApp.prototype.objAcross = function (obj1, fun) {
      var arr = [];
      let arr1 = obj1.list;

      for (let i = 0; i < arr1.length; i++) {
        const element1 = arr1[i];
        arr.push(fun({
          key: obj1.key,
          item: element1
        }));
      }

      return arr;
    };
    /**
     *
     *
     * @param {*} obj1
     * @param {*} obj2
     * @param {*} fun
     * @returns
     */


    MlApp.prototype.objAcross2 = function (obj1, obj2, fun) {
      var arr = [];
      let arr1 = obj1.list;
      let arr2 = obj2.list;

      for (let i = 0; i < arr1.length; i++) {
        const element1 = arr1[i];

        for (let ii = 0; ii < arr2.length; ii++) {
          const element2 = arr2[ii];
          arr.push(fun({
            key: obj1.key,
            item: element1
          }, {
            key: obj2.key,
            item: element2
          }));
        }
      }

      return arr;
    };

    MlApp.prototype.objAcross3 = function (obj1, obj2, obj3, fun) {
      var arr = [];
      let arr1 = obj1.list;
      let arr2 = obj2.list;
      let arr3 = obj3.list;

      for (let i = 0; i < arr1.length; i++) {
        const element1 = arr1[i];

        for (let ii = 0; ii < arr2.length; ii++) {
          const element2 = arr2[ii];

          for (let iii = 0; iii < arr3.length; iii++) {
            const element3 = arr3[iii];
            arr.push(fun({
              key: obj1.key,
              item: element1
            }, {
              key: obj2.key,
              item: element2
            }, {
              key: obj3.key,
              item: element3
            }));
          }
        }
      }

      return arr;
    };

    MlApp.prototype.SearchOfRoute = function (searchconfig, rowdata, isobject) {
      // pointcode,Name|GroupName&Id|GroupId&Flag=true,ex_ListPath
      if (searchconfig == 'null' || searchconfig === '' || !rowdata) {
        //为null 或者“” 返回‘’，即处理参数没有，还存在其他配置；如果为underfinded 值默认为Id
        return isobject ? {} : '';
      }

      var param = ['Id'];
      var submitdata; // 如果是underfined 则返回Id   ,即没有设置，只有地址或者功能码；

      if (searchconfig && searchconfig != 'null') {
        param = searchconfig.split('&'); //  Name|GroupName&Id|GroupId&Flag=true
      }

      if (isobject === true) {
        submitdata = {};

        for (let i = 0; i < param.length; i++) {
          const value = param[i];
          var se = value.split('=');

          if (se.length > 1) {
            submitdata[se[0]] = se[1];
          } else {
            var parr = value.split('|');
            var pname = parr[0]; //原表字段名称

            var sname = parr[1] || pname; //导向表字段名称

            submitdata[sname] = rowdata[pname];
          }
        } //param.forEach(function (value) {
        //});


        return submitdata;
      } else {
        submitdata = '?';

        for (let i = 0; i < param.length; i++) {
          const value = param[i];

          if (value.split('=').length > 1) {
            submitdata += value + '&';
          } else {
            var parr2 = value.split('|');
            var pname2 = parr2[0];
            var sname2 = parr2[1] || pname;
            submitdata += sname2 + '=' + rowdata[pname2] + '&';
          }
        }

        if (submitdata.length <= 1) {
          submitdata = ''; //运行不到 因为有默认的Id字段
        } else {
          submitdata = submitdata.substring(0, submitdata.length - 1);
        }

        return submitdata;
      }
    };
    /**
     *防抖动处理（一直触发，则只执行一次）
     *
     * @param {Function} fun
     * @param {Number} delay
     * @param {Boolean} immediate 是否立即执行，true:触发开始时执行，false:最后一次触发延迟delay后执行，
     * @returns
     */


    MlApp.prototype.debounce = function (fun, delay, immediate) {
      delay = delay || 1000;
      immediate = immediate == false ? false : true;
      let timeout = null;
      return function () {
        let context = this,
            args = arguments;
        timeout && clearTimeout(timeout);

        if (immediate) {
          var runFlag = !timeout; //不存在延迟处理程序，则可以立即运行；
          //产生一个空的延迟，防止后续的方法立即执行；

          timeout = setTimeout(() => {
            timeout = null; //设置null,让后续的事件可以立即触发；否则会延迟触发；
          }, delay);

          if (runFlag) {
            //第一次 立即执行
            fun.apply(context, args);
          }
        } else {
          timeout = setTimeout(() => {
            fun.apply(context, args);
          }, delay);
        }
      };
    };
    /**
     *节流，触发立即执行，一直触发，间隔delay 再执行，最后一次执行
     *
     * @param {*} fun
     * @param {*} delay
     * @returns
     */


    MlApp.prototype.throttle = function (fun, delay) {
      var timer = null;
      var startTime = Date.now();
      return function () {
        var curTime = Date.now();
        var remaining = delay - (curTime - startTime);
        var context = this;
        var args = arguments;
        clearTimeout(timer);

        if (remaining <= 0) {
          fun.apply(context, args);
          startTime = Date.now();
        } else {
          timer = setTimeout(fun, remaining);
        }
      };
    };

    MlApp.prototype.copy = function (text, successHandler, failHandler) {
      let btn = window.document.createElement('button');
      btn.setAttribute('data-clipboard-action', 'copy'); // cut

      btn.setAttribute('data-clipboard-text', text);
      var clipboard = new (clipboard_default())(btn);

      if (successHandler) {
        clipboard.on('success', e => {
          successHandler(e);
        });
      }

      if (failHandler) {
        clipboard.on('error', e => {
          failHandler(e);
        });
      }

      btn.click();
    };
  }

}

/* harmony default export */ const mlappExtension = (MlExtension);
;// CONCATENATED MODULE: ./src/extension/vueExtension.js
/* harmony default export */ function vueExtension(Vue, mlapp) {
  Vue.prototype.$setTimeout = function (handler, timeout) {
    let timer = setTimeout(handler, timeout);
    this.$once('hook:beforeDestroy', () => {
      clearTimeout(timer);
      timer = null;
    });
  };

  Vue.prototype.$setInterval = function (handler, timeout) {
    let timer = setInterval(handler, timeout);
    this.$once('hook:beforeDestroy', () => {
      clearInterval(timer);
      timer = null;
    });
  };

  Vue.prototype.$beforeDestroy = function (handler) {
    this.$once('hook:beforeDestroy', () => {
      handler();
    });
  }; // Vue.filter('debounce', function(fun, delay, immediate) {
  //   return mlapp.debounce(fun, delay, immediate);
  // });

}
;// CONCATENATED MODULE: ./src/filter/vueFilter.js
/* harmony default export */ function vueFilter(Vue, mlapp) {
  //filter
  Vue.filter('img', function (value) {
    if (value) {
      if (value.indexOf('://' < 0)) {
        value = mlapp.config.domainUrl + '/' + value;
      }
    } //console.log(value);


    return value; // || defaultImg;
  });
  Vue.filter('dateFormat', function (value, format) {
    // alert("1")
    if (!value) {
      return '';
    }

    if (typeof value == 'string') {
      return value.dateFormat(format);
    } else {
      return value.format(format);
    }
  });
  Vue.filter('toFixed', function (value, l) {
    if (typeof value != Number) {
      value = parseFloat(value);
    }

    value = value || 0;
    return value.toFixed(l);
  });
  Vue.filter('mgSubstring', function (value, begin, length, format) {
    begin = begin || 0;
    length = length || 10;
    format = format || '...';
    return value ? value.mgSubstring(0, length, format) : '';
  });
  Vue.filter('percent', function (value) {
    try {
      return (Math.round(value * 10000) / 100).toFixed(2) + '%';
    } catch {
      console.log('percent error:', value);
    }
  });
  Vue.filter('toTime', function (value) {
    try {
      if (value > 3600) {
        return new Date(value * 1000 + 3600000 * 12).mlformat('hh:mm:ss');
      } else {
        return new Date(value * 1000).mlformat('mm:ss');
      }
    } catch {
      console.log('toTime error:', value);
    }
  });
  Vue.filter('toSize', function (value) {
    try {
      if (value < 1024) {
        return value + 'B';
      } else if (value < 1024 * 1024) {
        return (value / 1024).toFixed(2) + 'KB';
      } else if (value < 1024 * 1024 * 1024) {
        return (value / 1024 / 1024).toFixed(2) + 'MB';
      } else if (value < 1024 * 1024 * 1024 * 1024) {
        return (value / 1024 / 1024 / 1024).toFixed(2) + 'GB';
      }
    } catch {
      console.log('toSize error:', value);
    }
  });
  Vue.filter('round', function (value, i) {
    try {
      if (value == null || value == undefined) {
        return '';
      }

      if (!i) {
        i = 2;
      }

      return value.toFixed(2);
    } catch {
      console.log('round error:', value, i);
    }
  });
  Vue.filter('nameCase', function (value, to) {
    if (value) {
      return value.nameCase(to);
    }

    return value;
  });
  Vue.filter('lower', function (value) {
    if (value) {
      return value.toLowerCase();
    }

    return value;
  }); //======================directive==================================
  // Vue.directive('auth',{
  //    bind
  // });

  Vue.directive('myif', {
    bind(el, binding, vnode) {
      console.log('bind', [el], binding, vnode);
      return false; // if (binding.value) el.parentNode.removeChild(el);
    },

    inserted(el, binding, vnode) {
      console.log('inserted', [el], binding, vnode, this);
      el.__ml__ = {
        v_myif: binding.value,
        __comment__: document.createComment('')
      };
      if (!binding.value) el.parentNode.replaceChild(el.__ml__.__comment__, el);
    },

    update(el, binding, vnode, oldVnode) {
      if (binding.value != el.__ml__.v_myif) {
        el.__ml__.v_myif = binding.value;

        if (binding.value) {
          el.__ml__.__comment__.parentNode.replaceChild(el, el.__ml__.__comment__);
        } else {
          el.parentNode.replaceChild(el.__ml__.__comment__, el);
        }
      } // console.log('update', [el], binding, vnode, oldVnode);

    },

    componentUpdated(el, binding, vnode, oldVnode) {// console.log('componentUpdated', el, binding, vnode, oldVnode);
    },

    unbind(el, binding, vnode) {
      console.log('unbind', el, binding, vnode);
    }

  });
  Vue.mixin({
    methods: {
      $path(name, nameDes, pathDes) {
        var rpath = this.$route && this.$route.name || '';
        var npath = this.$options.name || '';
        var path = name;

        if (rpath && npath) {
          path = `${rpath}:${npath}|${name}`;
        }

        if (nameDes) {
          path += '#' + nameDes;
        }

        if (pathDes) {
          path += '|' + pathDes;
        }

        return path;
      }

    }
  });
  Vue.directive('auth', {
    async inserted(el, binding, vnode) {
      // console.log('inserted', [el], binding, vnode, this);
      if (binding.value) {
        let url = mlapp.getPluginConfig('ml-auth').url;

        if (url) {
          let cacheFlag = mlapp.getPluginConfig('ml-auth').cache == true; //Home:ml-user-list|userEditBtn

          let path = '';
          let name = '';
          let mPath = '';
          let des = '';
          let pathDes = '';
          let nameDes = ''; //value:  路由:page主键|addBtn#地址页面说明|按键说明     or  addBtn#按键说明

          if (binding.value.indexOf('#') > -1) {
            let arr = binding.value.split('#');

            if (arr.length == 2) {
              mPath = arr[0];
              des = arr[1];
            }
          } else {
            mPath = binding.value;
          }

          if (mPath.indexOf('|') > -1) {
            let arr = binding.value.split('|');

            if (arr.length == 2) {
              path = arr[0];
              name = arr[1];
            }
          } else {
            name = mPath; //未配置页面，则自动获取路由页面

            var rpath = vnode.context.$route && vnode.context.$route.name || '';
            var npath = vnode.context.$options.name || '';

            if (rpath && npath) {
              path = `${rpath}:${npath}`;
            }
          }

          if (des.indexOf('|') > -1) {
            let arr = binding.value.split('|');

            if (arr.length == 2) {
              pathDes = arr[0];
              nameDes = arr[1];
            }
          } else {
            nameDes = des;
          }

          if (!nameDes) {
            //尝试取元素上的文字
            nameDes = el.innerText;
            nameDes = nameDes && nameDes.substring(0, 10);
          } //console.log('bbb', path, name, pathDes, nameDes);


          if (name) {
            let showFlag = false;
            el.__ml__ = {
              __auth_value__: binding.value,
              __comment__: document.createComment('')
            };
            el.parentNode && el.parentNode.replaceChild(el.__ml__.__comment__, el);
            await mlapp.queue('_mlComponentsAuthQueue_' + path, async () => {
              let cacheOptions = mlapp.getHash('_mlComponentsAuth', path);

              if (!cacheOptions) {
                //如果不存在缓存数据，则进行远程请求数据；
                let handler = mlapp.getPluginConfig('ml-auth').getOptionsHandler || async function (v, opt) {
                  return await v.$go(opt.url, {
                    path: opt.path
                  }).success(data => {
                    return data;
                  }).error(msg => {
                    v.$errorMsg(msg);
                  });
                };

                cacheOptions = await handler(mlapp, {
                  path: path,
                  url: url
                });

                if (cacheOptions && !cacheOptions.all) {
                  mlapp.$errorMsg && mlapp.$errorMsg("响应数据格式有误，要求{isAllAuth:false,all:{'test':{isAuth:true}}}") || console.error("响应数据格式有误，要求{isAllAuth:false,all:{'test':{isAuth:true}}}");
                }

                if (cacheFlag) {
                  mlapp.setHash('_mlComponentsAuth', path, cacheOptions);
                } else {
                  mlapp.setHash('_mlComponentsAuth', path, cacheOptions, 3, true);
                }
              }

              let authObj = cacheOptions;

              if (authObj) {
                if (authObj.isAllAuth) {
                  showFlag = true;
                  let item = authObj.all[name];

                  if (!item) {
                    //表示未记录设置，记录到缓存中，然后到操作授权处添加缓存记录，或直接添加
                    let pathTitle = path && `${path}|${name}` || name;
                    mlapp.setHash('_mlComponentsUnSettingAuthTemp', pathTitle, {
                      path: path,
                      name: name,
                      pathDes: pathDes,
                      title: nameDes
                    });
                  }
                } else {
                  //console.log(authObj);
                  let item = authObj.all[name];

                  if (item && item.isAuth) {
                    showFlag = true;
                  }
                }
              }

              if (showFlag) {
                el.__ml__.__comment__.parentNode && el.__ml__.__comment__.parentNode.replaceChild(el, el.__ml__.__comment__);
              }
            });
          }
        }
      }
    }

  });
}
// EXTERNAL MODULE: ./node_modules/axios/index.js
var axios = __webpack_require__(669);
var axios_default = /*#__PURE__*/__webpack_require__.n(axios);
;// CONCATENATED MODULE: ./src/utils/go.js


class ResPromise extends Promise {
  success(h) {
    let _ = this;

    return _.then(res => {
      let result = res.data || {};

      if (result.isSuccess === true) {
        return Promise.resolve(h(result.data, result.message, result.code, res));
      } else {
        return Promise.resolve(h(result, '响应成功', 1, res));
      }
    });
  }

  error(h) {
    let _ = this;

    return _.catch(res => {
      let result = res.data || {};

      if (result.isSuccess === false) {
        return Promise.resolve(h(result.message, result.code, result.data, res)); // new ResPromise((r, e) => e('exxxx'));
      } else {
        return Promise.resolve(h(res.message, 500, null, res));
      }
    });
  }

}

class Go {
  __interceptors = null;
  __urls = {};
  _httpConfig = {
    options: {
      timeout: 20000
    },
    setUrl: (key, url, group) => {
      let __urls = this.__urls;

      if (Array.isArray(key)) {
        for (let i = 0; i < key.length; i++) {
          const item = key[i];

          if (Array.isArray(item)) {
            if (item[0][0] != '@') {
              item[0] = '@' + item[0];
            }

            __urls[item[0]] = {
              url: item[1],
              group: url
            };
          } else {
            if (item.key[0] != '@') {
              item.key = '@' + item.key;
            }

            __urls[item.key] = {
              url: item.value,
              group: url
            };
          }
        }
      } else {
        if (key[0] != '@') {
          key = '@' + key;
        }

        __urls[key] = {
          url: url,
          group: group
        };
      }

      return this._httpConfig;
    },
    event: {
      default: {
        before: null,
        success: null,
        error: null
      }
    },
    setInterceptors: handler => {
      this.__interceptors = handler;
    }
  };
  #instance = null;

  constructor(httpConfigHandler) {
    httpConfigHandler && httpConfigHandler(this._httpConfig);
    this.#instance = axios_default().create(this._httpConfig.options);
    this.__interceptors && this.__interceptors(this.#instance.interceptors);
  }

  install(ObjClass) {
    let $go = this;
    let target = null;

    if (typeof ObjClass == 'object') {
      target = ObjClass;
    } else {
      target = ObjClass.prototype;
    }

    target.$go = function (url, data, config, options) {
      let _ = this;

      let opt = null;
      let conf = null;

      if (typeof url === 'string') {
        opt = {
          url: url,
          data: data,
          ...options
        };
        conf = config;
      } else {
        opt = url; // { ...url, ...options };

        conf = data; // { ...data, ...config };
      }

      return $go._go(_, opt, conf);
    };

    target.$go.get = function (url, data, config) {
      return this.$go(url, data, { ...config,
        ...{
          method: 'get'
        }
      });
    };

    target.$go.msg = function (url, data, config) {
      return this.$go(url, data, config, {
        showMsg: true
      });
    };

    target.$go_get = function (url, data, config) {
      return this.$go(url, data, { ...config,
        ...{
          method: 'get'
        }
      });
    };

    target.$go_msg = function (url, data, config) {
      return this.$go(url, data, config, {
        showMsg: true
      });
    };

    target.$axios = this._go2;
  }

  _go(target, options, config) {
    let $go = this;
    let _ = target;
    let __urls = $go.__urls;
    let _httpConfig = $go._httpConfig;
    let opt = { ...{
        url: '',
        data: null,
        before: null,
        success: null,
        error: null,
        complete: null,
        showMsg: null,
        showMsgType: 0b01
      },
      ...options
    };

    if (opt.showMsgType == 0b01) {
      if (opt.showMsg === true) {
        opt.showMsgType = 0b11;
      } else if (opt.showMsg === false) {
        opt.showMsgType = 0b00;
      }
    }

    config = config || {};
    let url = opt.url || config.url;
    let data = opt.data || config.data;
    let urlObj = {
      key: '',
      url: url,
      group: ''
    };

    if (url && url[0] == '@' && __urls[url]) {
      urlObj.key = url;
      urlObj.url = __urls[url].url;
      urlObj.group = __urls[url].group;
      url = urlObj.url;
    }

    let _conf = Object.assign({}, {
      url: url,
      data: data,
      method: 'post',
      urlObj: urlObj
    }, config);

    return new ResPromise((r, e) => {
      let glEvent = _httpConfig.event[urlObj.group || 'default'] || {};

      try {
        let beforeR = opt.before && opt.before.call(_, _conf);

        if (beforeR !== false) {
          beforeR = glEvent.before && glEvent.before.call(_, _conf);
        }

        let request = $go.#instance;

        if (beforeR) {
          request = function (url, rconf) {
            return new Promise((_r, _e) => {
              try {
                _r({
                  data: beforeR,
                  config: rconf,
                  request: {},
                  response: {
                    status: 200
                  }
                });
              } catch (error) {
                _e(error);
              }
            });
          };
        }

        request(url, _conf).then(res => {
          let result = res.data; // result.origin = res;

          if (result.isSuccess === true) {
            if ((opt.showMsgType >> 1 & 1) === 1) {
              _.$successMsg && _.$successMsg(res.data.message);
            }

            opt.success && opt.success.call(_, result.data, result.msg, result.code, res);
            r(res);
          } else if (res.data.isSuccess === false) {
            if ((opt.showMsgType >> 0 & 1) === 1) {
              _.$errorMsg && _.$errorMsg(result.message);
            }

            let gcr = glEvent.error && glEvent.error.call(_, result.msg, result.code, result.data, res);

            if (gcr !== false) {
              opt.error && opt.error.call(_, result.msg, result.code, result.data, res);
              e(res);
            }
          } else {
            opt.success && opt.success.call(_, result, '响应成功', 1, res);
            r(res);
          }
        }).catch(ex => {
          let status = 500;
          let data = null;
          let msg = ex.message;

          if (ex.response) {
            status = ex.response.status;
            let rdata = ex.response.data;

            if (rdata) {
              if (rdata.isSuccess === false) {
                data = rdata.data;
                msg = rdata.message;
              } else {
                data = rdata;
              }
            }
          }

          if ((opt.showMsgType >> 0 & 1) === 1) {
            _.$errorMsg && _.$errorMsg(msg);
          }

          let gcr = glEvent.error && glEvent.error.call(_, msg, status, data, ex);

          if (gcr !== false) {
            opt.error && opt.error.call(_, msg, status, data, ex);
            e(ex);
          }
        });
      } catch (ex) {
        if ((opt.showMsgType >> 0 & 1) === 1) {
          _.$errorMsg && _.$errorMsg(ex.message);
        }

        let gcr = glEvent.error && glEvent.error.call(_, ex.message, 500, null, ex);

        if (gcr !== false) {
          opt.error && opt.error.call(_, ex.message, 500, null, ex);
          e(ex);
        }

        console.error(ex);
      }
    });
  }

  _go2(url, data, config) {
    let _conf = Object.assign({}, {
      data: data,
      method: 'post'
    }, config);

    var pro = this.#instance(url, _conf);
    return pro;
  }

}

/* harmony default export */ const go = (Go);
;// CONCATENATED MODULE: ./src/utils/msg.js
class MLMsg {
  #msgHandler = null;
  #config = {
    options: {
      msg: '',
      type: 0 //0:default; 1:success;  2:error

    },
    setMsg: f => {
      this.#msgHandler = f;
    }
  };

  constructor(configHandler) {
    configHandler && configHandler(this.#config);
  }

  #msg(target, msg, options) {
    let opt = { ...this.#config.options,
      ...options,
      msg: msg
    };
    this.#msgHandler && this.#msgHandler(target, opt);
  }

  install(ObjClass) {
    let _ = this;

    let target = null;

    if (typeof ObjClass == 'object') {
      target = ObjClass;
    } else {
      target = ObjClass.prototype;
    }

    target.$msg = this.#msg;

    target.$successMsg = function (msg) {
      let _target = this;

      _.#msg(_target, msg, {
        type: 1
      });
    };

    target.$errorMsg = function (msg) {
      let _target = this;

      _.#msg(_target, msg, {
        type: 2
      });
    };
  }

}

/* harmony default export */ const msg = (MLMsg);
;// CONCATENATED MODULE: ./src/utils/identity.js
class MinglIdentity {
  #claims = {};
  #user = {};
  #isAuthenticated = false;
  #authenticateHandler = null;
  #signInHandler = null;
  #signOutHandler = null;
  #refreshHandler = null;
  #startHandler = null;
  #config = {
    onStart: f => {
      this.#startHandler = f;
    },
    onAuthenticate: f => {
      this.#authenticateHandler = f;
    },
    onSignIn: f => {
      this.#signInHandler = f;
    },
    onSignOut: f => {
      this.#signOutHandler = f;
    },
    onRefresh: f => {
      this.#refreshHandler = f;
    }
  };
  #identity = null;
  accessToken = '';

  constructor(handler, Vue) {
    handler && handler(this.#config);
    let user = {
      name: ''
    };
    this.#user = Vue.observable && Vue.observable(user) || user;
    this.#identity = Vue.observable && Vue.observable(this) || this;
    this.start(this);
  }

  get user() {
    return this.#user;
  }

  get isAuthenticated() {
    return this.#isAuthenticated;
  }

  clear() {
    this.#isAuthenticated = false;
    this.#claims = {};

    for (const key in this.#user) {
      if (Object.hasOwnProperty.call(this.#user, key)) {
        this.#user[key] = '';
      }
    }
  }

  setUserInfo(user) {
    this.#isAuthenticated = true;

    if (user) {
      if (typeof user == 'function') {
        user(this.#user);
      } else if (typeof user == 'object') {
        // console.log('uuu', user);
        for (const key in user) {
          if (Object.hasOwnProperty.call(user, key)) {
            const element = user[key];
            this.#user[key] = element;
          }
        }
      }
    }
  }

  setAccessToken(accessToken) {
    this.#isAuthenticated = true;
    this.accessToken = accessToken;
  }

  async start(...args) {
    if (this.#startHandler) {
      return await this.#startHandler(this, ...args);
    }
  }

  async signIn(...args) {
    this.#isAuthenticated = true;

    if (this.#signInHandler) {
      return await this.#signInHandler(this, ...args);
    }
  }

  async signOut(...args) {
    this.clear();

    if (this.#signOutHandler) {
      return await this.#signOutHandler(this, ...args);
    }
  }

  async authenticate(...args) {
    //  console.info('authenticateHandler', this.#authenticateHandler);
    if (this.#authenticateHandler) {
      return await this.#authenticateHandler(this, ...args);
    }

    return true;
  }

  async refresh(...args) {
    if (this.#refreshHandler) {
      return await this.#refreshHandler(this, ...args);
    }
  }

  install(ObjClass) {
    let _ = this;

    if (typeof ObjClass == 'object') {
      ObjClass.$identity = this.#identity;
    } else {
      Object.defineProperty(ObjClass.prototype, '$identity', {
        get: function () {
          return _.#identity;
        },

        set(v) {
          return v;
        }

      });
    } // Vue.prototype.$identity = new Proxy(identity, {
    //   get(obj, prop) {
    //     let v = prop in obj ? obj[prop] : null;
    //     console.log('getpro', prop, v);
    //     return v;
    //   },
    //   set(obj, prop, value) {
    //     if (prop in obj) {
    //       console.log('setpro', prop, value);
    //       obj[prop] = value;
    //       return true;
    //     }
    //     return false;
    //   },
    // });

  }

  addClaim(key, value) {
    this.#claims[key] = value;
  }

  getClaim(key) {
    return this.#claims[key];
  }

}

/* harmony default export */ const identity = (MinglIdentity);
;// CONCATENATED MODULE: ./src/mlapp/mingl-core.js







 //

class MinglLoader {
  install = (Vue, dependencies, dependencyComponents) => {
    if (dependencies) {
      for (let i = 0; i < dependencies.length; i++) {
        const depend = dependencies[i];
        Vue.use(depend);
      }
    }

    if (dependencyComponents) {
      for (let i = 0; i < dependencyComponents.length; i++) {
        const component = dependencyComponents[i];

        if (!component.name) {
          console.error('未设置名称', component);
        }

        Vue.component(component.name, component);
      }
    }
  };
}

class MinglCore {
  vue = null;
  #pluginsConfig = {};
  $ml = null;
  $global = null;

  constructor() {}

  installPlugin(name, plugin, defaultInstallers, Vue) {
    let pluginConfig = this.$ml.getPluginConfig(name);
    let installers = pluginConfig.installers || defaultInstallers;
    let obj = new plugin(pluginConfig.configHandler, Vue);

    for (let i = 0; i < installers.length; i++) {
      const installer = installers[i];

      if (typeof installer == 'object' && installer.installer) {
        let sobj = new plugin(installer.configHander || pluginConfig.configHandler, Vue);
        sobj.install(installer); // plugin(
        //   installer.installer,
        //   installer.configHander || pluginConfig.configHandler
        // );
      } else {
        obj.install(installer); // plugin(installer, pluginConfig.configHandler);
      }
    }
  }

  install(Vue, handler, global) {
    this.vue = Vue;

    if (global) {
      this.$global = global;
    }

    this.$ml = new mlapp_mlapp(this.$global);
    let mlapp = this.$ml;
    Vue.prototype.$ml = mlapp;
    handler && handler(mlapp, mlapp.config);
    Vue.prototype.$lang = mlapp.getCache('_lang');
    vueExtension(Vue, mlapp);
    vueFilter(Vue, mlapp); //初始化基础功能

    this.installPlugin('ml-msg', msg, [Vue, mlapp]);
    this.installPlugin('ml-go', go, [Vue, mlapp]);
    this.installPlugin('ml-identity', identity, [Vue, mlapp], Vue);
  }

  load(dependencies, dependencyComponents) {
    new MinglLoader().install(this.vue, dependencies, dependencyComponents);
  }

}

mlapp_mlapp.use(new mlappExtension());
let minglCore = new MinglCore();
/* harmony default export */ const mingl_core = (minglCore);
;// CONCATENATED MODULE: ./src/index.js


/* harmony default export */ const src = (mingl_core); // let mlGlobal = new MlGlobal();
// export { MlCore, mlGlobal as MlGlobal };


})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});