

// Wrapper class for AWS Lambda
function Wrapped(mod, options) {
    if (options == null) {
        options = {};
    }

    this.lambdaModule = mod;
    var handler = options.handler || 'handler';

    if (mod[handler]) {
        this.handler =mod[handler];
    }
}

Wrapped.prototype.runHandler = function(event, customContext, callback) {
    var callback;

    var defaultContext = {
        succeed: function(success) {
            return callback(null, success);
        },
        fail: function(error) {
            return callback(error, null);
        },
        done: function(error, success) {
            return callback(error, success);
        }
    };

    var lambdaContext = customContext;

    if (!lambdaContext.succeed) {
        lambdaContext.succeed = defaultContext.succeed;
    }
    if (!lambdaContext.fail) {
        lambdaContext.fail = defaultContext.fail;
    }   
    if (!lambdaContext.done) {
        lambdaContext.done = defaultContext.done;
    }

    try {
        if (this.handler) {
            this.handler(event, lambdaContext, callback);
        } else {
            var AWS = require('aws-sdk');
            if (this.lambdaModule.region) {
                AWS.config.update({
                    region: this.lambdaModule.region
                });
            }
            var lambda = new AWS.Lambda();
            var params = {
                FunctionName: this.lambdaModule.lambdaFunction,
                InvocationType: 'RequestResponse',
                LogType: 'None',
                Payload: JSON.stringify(event),
            }; 
            lambda.invoke(params, function(err, data) {
                if (err) {
                    return callback(err);
                }

                callback(null, JSON.parse(data.Payload));
            });
        }
    } catch (ex) {
        throw(ex);
    }
}

Wrapped.prototype.run = function(event, callback) {
   return this.runHandler(event,{},callback);
};

// Wrapper factory

function wrap(mod, options) {
    var wrapped = new Wrapped(mod, options);

    return wrapped;
}

// Static variables (for backwards compatibility)

var latest;

// Public interface for the module

module.exports = exports = {

    // reusable wrap method
    wrap: wrap,

    // static init/run interface for backwards compatibility
    init: function(mod, options) {
        latest = wrap(mod, options);
    },
    run: function(event, callback) {
        if (typeof latest === typeof undefined) {
            return callback('Module not initialized', null);
        } else {
            latest.run(event, callback);
        }
    }
};
