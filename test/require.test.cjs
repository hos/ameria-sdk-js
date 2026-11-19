// CommonJS consumers on Node >= 22.12 can require() the ESM build.
const { test } = require("node:test");
const assert = require("node:assert/strict");

test("package can be required from CommonJS", () => {
  const sdk = require("@ameria/vpos-sdk");
  assert.equal(typeof sdk.AmeriaClient, "function");
  assert.equal(typeof sdk.AmeriaHttpError, "function");
  assert.equal(sdk.PaymentTypes.BindingMainRest, 6);
});
