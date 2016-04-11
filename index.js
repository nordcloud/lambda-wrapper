

// Wrapper class for AWS Lambda

function Wrapped(mod) {
    this.lambdaModule = mod;
}
Wrapped.prototype.run = function(event, callback) {

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
        this.lambdaModule.handler(event, lambdacontext);
    } catch (ex) {
        throw(ex);
    }
};

// Wrapper factory

function wrap(mod) {
    var wrapped = new Wrapped(mod);
    return wrapped;
}

// Static variables (for backwards compatibility)

var latest;

// Public interface for the module

module.exports = exports = {

    // reusable wrap method
    wrap: wrap,

    // static init/run interface for backwards compatibility
    init: function(mod) {
        latest = wrap(mod);
    },
    run: function(event, callback) {
        if (typeof latest === typeof undefined) {
            return callback('Module not initialized', null);
        } else {
            latest.run(event, callback);
        }
    }
};
