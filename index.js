'use strict';

const AWS = require('aws-sdk');

const httpRunner = require('./httpRunner');

// Wrapper class for AWS Lambda
class Wrapped {
  constructor(mod, opts) {
    const options = opts || {};

    this.lambdaModule = mod;
    const handler = options.handler || 'handler';

    if (mod[handler]) {
      this.handler = mod[handler];
    }
  }

  runDirect(event, context, cb) {
    this.handler(event, context, cb);
  }

  runRemote(event, cb) {
    if (this.lambdaModule.region) {
      AWS.config.update({
        region: this.lambdaModule.region
      });
    }

    const lambda = new AWS.Lambda();
    const params = {
      FunctionName: this.lambdaModule.lambdaFunction,
      InvocationType: 'RequestResponse',
      LogType: 'None',
      Payload: JSON.stringify(event)
    };

    lambda.invoke(params, (err, data) => {
      if (err) {
        return cb(err);
      }
      if (data.FunctionError) {
        return cb(Object.assign(new Error(JSON.parse(data.Payload).errorMessage), data));
      }
      return cb(null, JSON.parse(data.Payload));
    });
  }

  runHttp(event, cb) {
    httpRunner(event, this.lambdaModule, cb);
  }

  runHandler(event, customContext, cb) {
    return new Promise((resolve, reject) => {

      const promiseCallback = (error, response) => {
        if(error) {
          return reject(error);
        }
        return resolve(response);
      };

      const callback = cb || promiseCallback;

      const defaultContext = {
        succeed: success => callback(null, success),
        fail: error => callback(error, null),
        done: (error, success) => callback(error, success)
      };

      const lambdaContext = Object.assign({}, defaultContext, customContext);

      try {
        if (this.handler) {
          if (isFunction(this.handler)) {
            this.runDirect(event, lambdaContext, callback);
          } else {
            reject('Handler is not a function');
          }
        } else if (isString(this.lambdaModule)) {
          this.runHttp(event, callback);
        } else {
          this.runRemote(event, callback);
        }
      } catch (ex) {
        return callback(ex);
      }
    });
  }

  run(event, context, callback) {
    let callbackFunction = callback;
    let contextObject = context;
    if (typeof context === 'function') {
      // backwards compability
      callbackFunction = context;
      contextObject = {};
    }
    return this.runHandler(event, contextObject, callbackFunction);
  }
}

function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

function isString(value) {
  return typeof value === 'string';
}

// Wrapper factory

const wrap = (mod, options) => new Wrapped(mod, options);

// Static variables (for backwards compatibility)

let latest;

// Public interface for the module

module.exports = exports = {

  // reusable wrap method
  wrap,

  // static init/run interface for backwards compatibility
  init: (mod, options) => {
    latest = wrap(mod, options);
  },
  run: (event, context, callback) => new Promise((resolve, reject) => {
    let callbackFunction = callback;
    let contextObject = context;
    if (typeof context === 'function') {
      // backwards compability
      callbackFunction = context;
      contextObject = {};
    }
    if (typeof latest === typeof undefined) {
      const error = 'Module not initialized';
      reject(error);
      return callbackFunction(error, null);
    }
    return latest.run(event, contextObject, (err, data) => {
      if (callbackFunction) {
        return callbackFunction(err, data);
      }
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  })
};
