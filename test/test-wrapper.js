var testMod1 = {
    handler: function(event, context) {
        if (event.test === 'success') {
            context.succeed('Success');
        } 
        if (event.test === 'fail') {
            context.fail('Fail');
        }
    }
};

var testMod2 = {
    handler: function(event, context) {
        context.succeed(event);        
    }
};

var wrapper = require('../index.js');
var expect = require('chai').expect;

describe('lambda-wrapper', function() {
  it('init + run with success', function(done) {
    wrapper.init(testMod1);
    wrapper.run({test: 'success'}, function(err, response) {
      expect(response).to.be.equal('Success');
      done();
    });
  });
  it('init + run with failure', function(done) {
    wrapper.init(testMod1);
    wrapper.run({test: 'fail'}, function(err, response) {
      expect(err).to.be.equal('Fail');
      done();
    });
  });
});
