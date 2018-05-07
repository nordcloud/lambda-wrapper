"use strict";

const wrapper = require("../../index.js");
const expect = require("chai").expect;

const testMod7 = {
  handler: async (event, context) => {
    if (event.test === "success") {
      return "Success";
    }
    if (event.test === "fail") {
      throw new Error("Fail");
    }
  }
};

describe("lambda wrapper local async", () => {
  it("wrap + run async module 7 - await", async () => {
    const w = wrapper.wrap(testMod7);

    const response = await w.run({ test: "success" });
    expect(response).to.be.equal("Success");
  });

  it("wrap + run async module 7 - promise", done => {
    const w = wrapper.wrap(testMod7);

    w.run({ test: "success" }).then(response => {
        expect(response).to.be.equal("Success");
        done();
      }).catch(done);
  });

  it("wrap + run async module 7 - exception", async () => {
    const w = wrapper.wrap(testMod7);

    try {
      const response = await w.run({ test: "fail" });
      expect(response).to.be.null;
    } catch (err) {
      expect(err).to.be.instanceof(Error);
    }
  });
});
