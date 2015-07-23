// Pseudowrapper for AWS Lambda
// 
var lambdaModule;

var _runner = function(event, callbackFn) {	
	if (!lambdaModule) {
		return callbackFn('Module not initialized',null);
	}

	var lambdacontext = {
		succeed : function(success) {
			return callbackFn(null, success);
		},
		fail : function(error) {				
			return callbackFn(error,null);
		}
	};
	try {
		lambdaModule.handler(event, lambdacontext);
	} catch (ex) {
		callbackFn('Exception:' + ex.toString());
	}
};

// Public interface for the module
module.exports = exports = {
	init : function(modName) {
		if (!modName) {
			modName = '';
		}

		try {
			lambdaModule = require(modName);
			// Return the module;
			return this;
		} catch(ex) {
			lambdaModule = require(process.cwd() + '/' + modName);
			return this;
		} 
		return null;
	},
	run: _runner
};
