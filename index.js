// Pseudowrapper for AWS Lambda
var lambdaModule;

var _runner = function(event, callback) {
    if (!lambdaModule) {
        return callback('Module not initialized', null);
    }

    var lambdacontext = {
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

    try {
        lambdaModule.handler(event, lambdacontext);
    } catch (ex) {
        throw(ex);
    }
};

// Public interface for the module
module.exports = exports = {
    init: function(mod) {
        lambdaModule = mod;
    },
    run: _runner
};
