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
        }
    };

    try {
        lambdaModule.handler(event, lambdacontext);
    } catch (ex) {
        callback('Exception:' + ex.toString());
    }
};

// Public interface for the module
module.exports = exports = {
    init: function(mod) {
        lambdaModule = mod;
    },
    run: _runner
};
