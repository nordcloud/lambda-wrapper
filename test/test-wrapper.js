'use strict';

const wrapper = require('../index.js');
const expect = require('chai').expect;

const testMod1 = {
  handler: (event, context) => {
    if (event.test === 'success') {
      context.succeed('Success');
    }
    if (event.test === 'fail') {
      context.fail('Fail');
    }
  }
};

const testMod2 = {
  handler: (event, context) => {
    context.succeed(event);
  }
};

const testMod3 = {
  handler: (event, context, callback) => {
    callback(null, event);
  }
};

const testMod4 = {
  myHandler: (event, context, callback) => {
    callback(null, event);
  }
};

const testMod5 = {
  handler: (event, context, callback) => {
    callback(null, {
      test: context.functionName
    });
  }
};

describe('lambda-wrapper local', () => {
  it('init + run with success - callback', (done) => {
    wrapper.init(testMod1);

    wrapper.run({test: 'success'}, (err, response) => {
      expect(response).to.be.equal('Success');
      done();
    });
  });

  it('init + run with success - promise', (done) => {
    wrapper.init(testMod1);

    wrapper.run({test: 'success'})
      .then((response) => {
        expect(response).to.be.equal('Success');
        done();
      })
      .catch(done);
  });

  it('init + run with failure - callback', (done) => {
    wrapper.init(testMod1);

    wrapper.run({test: 'fail'}, (err, response) => {
      expect(err).to.be.equal('Fail');
      done();
    });
  });

  it('init + run with failure - promise', (done) => {
    wrapper.init(testMod1);

    wrapper.run({test: 'fail'}).catch((err) => {
      expect(err).to.be.equal('Fail');
      done();
    });
  });

  it('wrap + run module 2 - callback', (done) => {
    const w = wrapper.wrap(testMod2);

    w.run({foo: 'bar'}, (err, response) => {
      expect(response.foo).to.be.equal('bar');
      done();
    });
  });

  it('wrap + run module 2 - promise', (done) => {
    const w = wrapper.wrap(testMod2);

    w.run({foo: 'bar'})
      .then((response) => {
        expect(response.foo).to.be.equal('bar');
        done();
      })
      .catch(done);
  });

  it('wrap + run module 1 - callback', (done) => {
    const w = wrapper.wrap(testMod1);

    w.run({test: 'success'}, (err, response) => {
      expect(response).to.be.equal('Success');
      done();
    });
  });

  it('wrap + run module 1 - promise', (done) => {
    const w = wrapper.wrap(testMod1);

    w.run({test: 'success'})
      .then((response) => {
        expect(response).to.be.equal('Success');
        done();
      })
      .catch(done);
  });

  it('wrap + run module 3 (callback notation) - callback', (done) => {
    const w = wrapper.wrap(testMod3);

    w.run({test: 'cbsuccess'}, (err, response) => {
      expect(response.test).to.be.equal('cbsuccess');
      done();
    });
  });

  it('wrap + run module 3 (callback notation) - promise', (done) => {
    const w = wrapper.wrap(testMod3);

    w.run({test: 'cbsuccess'})
      .then((response) => {
        expect(response.test).to.be.equal('cbsuccess');
        done();
      })
      .catch(done);
  });

  it('wrap + run module 4 (alternate handler) - callback', (done) => {
    const w = wrapper.wrap(testMod4, {
      handler: 'myHandler'
    });

    w.run({test: 'cbsuccess'}, (err, response) => {
      expect(response.test).to.be.equal('cbsuccess');
      done();
    });
  });

  it('wrap + run module 4 (alternate handler) - promise', (done) => {
    const w = wrapper.wrap(testMod4, {
      handler: 'myHandler'
    });

    w.run({test: 'cbsuccess'})
      .then((response) => {
        expect(response.test).to.be.equal('cbsuccess');
        done();
      })
      .catch(done);
  });

  it('wrap + runHandler module 5 (custom context) - callback', (done) => {
    const w = wrapper.wrap(testMod5);

    w.runHandler({ test: 'cbsuccess' }, { functionName: 'testing' }, (err, response) => {
      expect(response.test).to.be.equal('testing');
      done();
    });
  });

  it('wrap + runHandler module 5 (custom context) - promise', (done) => {
    const w = wrapper.wrap(testMod5);

    w.runHandler({ test: 'cbsuccess' }, { functionName: 'testing' })
      .then((response) => {
        expect(response.test).to.be.equal('testing');
        done();
      })
      .catch(done);
  });
});

describe('lambda-wrapper live', () => {
  it('can call lambda functions deployed in AWS - callback', (done) => {
    const w = wrapper.wrap({
      lambdaFunction: 'lambdaWrapper-test',
      region: process.env.AWS_DEFAULT_REGION || 'eu-central-1'
    });

    w.run({ test: 'livesuccess' }, (err, response) => {
      if (err) {
        return done(err);
      }

      expect(response.src).to.be.equal('lambda');
      expect(response.event.test).to.be.equal('livesuccess');
      done();
    });
  });

  it('can call lambda functions deployed in AWS - promise', (done) => {
    const w = wrapper.wrap({
      lambdaFunction: 'lambdaWrapper-test',
      region: process.env.AWS_DEFAULT_REGION || 'eu-central-1'
    });

    w.run({ test: 'livesuccess' })
      .then((response) => {
        expect(response.src).to.be.equal('lambda');
        expect(response.event.test).to.be.equal('livesuccess');
        done();
      }).catch(done);
  });
});
