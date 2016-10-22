'use strict';

const AWS = require('aws-sdk');

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
          this.handler(event, lambdaContext, callback);
        } else {
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
              return callback(err);
            }

            return callback(null, JSON.parse(data.Payload));
          });
        }
      } catch (ex) {
        throw (ex);
      }
    });
  }

  run(event, callback) {
    return this.runHandler(event, {}, callback);
  }
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
  run: (event, callback) => new Promise((resolve, reject) => {
    if (typeof latest === typeof undefined) {
      const error = 'Module not initialized';
      reject(error);
      return callback(error, null);
    }
    return latest.run(event, (err, data) => {
      if (callback) {
        return callback(err, data);
      }
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  })
};
