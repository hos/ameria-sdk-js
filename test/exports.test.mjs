import { test } from "node:test";
import assert from "node:assert/strict";
import * as sdk from "@ameria/vpos-sdk";

test("package entry point exports the public API", () => {
  assert.deepEqual(Object.keys(sdk).sort(), [
    "AmeriaHttpError",
    "Client",
    "PaymentTypes",
    "RESPONSE_CODES",
  ]);
});
