import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { inspect } from "node:util";
import { Client, AmeriaHttpError } from "../dist/index.js";

const creds = { clientId: "cid", username: "user", password: "s3cret" };
const realFetch = globalThis.fetch;
let calls;

function mockFetch(reply = {}, init = {}) {
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options, body: JSON.parse(options.body) });
    const body = typeof reply === "string" ? reply : JSON.stringify(reply);
    return new Response(body, {
      status: init.status ?? 200,
      headers: {
        "content-type": init.contentType ?? "application/json; charset=utf-8",
      },
    });
  };
}

beforeEach(() => {
  calls = [];
});
afterEach(() => {
  globalThis.fetch = realFetch;
});

test("uses test host and merges credentials into the body", async () => {
  mockFetch({ PaymentID: "abc", ResponseCode: 1, ResponseMessage: "OK" });
  const client = new Client({ ...creds, isTest: true });
  const res = await client.initPayment({
    orderID: 2000001,
    amount: 10,
    description: "d",
    backURL: "https://example.com/back",
    opaque: "o",
    lang: "en",
  });
  assert.equal(
    calls[0].url,
    "https://servicestest.ameriabank.am/VPOS/api/VPOS/InitPayment",
  );
  assert.equal(calls[0].options.method, "POST");
  assert.equal(calls[0].options.redirect, "error");
  assert.ok(calls[0].options.signal instanceof AbortSignal);
  assert.deepEqual(
    { ...calls[0].body },
    {
      OrderID: 2000001,
      Amount: 10,
      Description: "d",
      BackURL: "https://example.com/back",
      Opaque: "o",
      ClientID: "cid",
      Username: "user",
      Password: "s3cret",
    },
  );
  assert.equal(
    res.url,
    "https://servicestest.ameriabank.am/VPOS/Payments/Pay?id=abc&lang=en",
  );
});

test("production host by default; no url when InitPayment fails", async () => {
  mockFetch({ PaymentID: "", ResponseCode: 2, ResponseMessage: "bad" });
  const res = await new Client(creds).initPayment({
    orderID: 1,
    amount: 5,
    description: "d",
    backURL: "https://x",
    opaque: "",
  });
  assert.match(calls[0].url, /^https:\/\/services\.ameriabank\.am\/VPOS\//);
  assert.equal(res.url, null);
});

test("credentials are sent with every call", async () => {
  mockFetch({});
  await new Client(creds).cancelPayment("p1");
  assert.equal(calls[0].body.Password, "s3cret");
  assert.equal(calls[0].body.PaymentID, "p1");
});

test("getUrl encodes the payment id", () => {
  const c = new Client(creds);
  assert.equal(
    c.getUrl("a&b=c"),
    "https://services.ameriabank.am/VPOS/Payments/Pay?id=a%26b%3Dc",
  );
});

test("getPendingTransactions sends both dates", async () => {
  mockFetch([]);
  await new Client(creds).getPendingTransactions({
    startDate: new Date("2026-01-01T00:00:00Z"),
    endDate: new Date("2026-01-31T00:00:00Z"),
  });
  assert.equal(calls[0].body.StartDate, "2026-01-01T00:00:00.000Z");
  assert.equal(calls[0].body.EndDate, "2026-01-31T00:00:00.000Z");
});

test("payment types map to codes, None (0) included", async () => {
  mockFetch({});
  const c = new Client(creds);
  await c.getBindings("None");
  await c.activateBinding("h1", "Arca");
  await c.makeBindingPayment({
    amount: 1,
    backURL: "https://x",
    cardHolderID: "h1",
    currency: "051",
    description: "d",
    opaque: "",
    orderID: 3,
  });
  assert.equal(calls[0].body.PaymentType, 0);
  assert.equal(calls[1].body.PaymentType, 1);
  assert.equal(calls[2].body.PaymentType, 6); // BindingMainRest default
  await assert.rejects(c.getBindings("Nope"), TypeError);
});

test("rejects invalid amounts before calling the bank", async () => {
  mockFetch({});
  const c = new Client(creds);
  for (const amount of [0, -1, NaN, Infinity, "10"]) {
    await assert.rejects(c.refundPayment("p", amount), RangeError);
  }
  assert.equal(calls.length, 0);
});

test("non-2xx and non-JSON responses throw AmeriaHttpError", async () => {
  const c = new Client(creds);
  mockFetch("<html>oops</html>", { status: 500, contentType: "text/html" });
  await assert.rejects(c.getPaymentDetails("p"), (e) => {
    assert.ok(e instanceof AmeriaHttpError);
    assert.equal(e.status, 500);
    assert.equal(e.endpoint, "GetPaymentDetails");
    assert.ok(!e.message.includes("s3cret"));
    return true;
  });
  mockFetch("maintenance", { status: 200, contentType: "text/plain" });
  await assert.rejects(c.getPaymentDetails("p"), AmeriaHttpError);
});

test("credentials are not exposed via inspection or serialization", () => {
  const c = new Client(creds);
  assert.ok(!inspect(c, { depth: 5 }).includes("s3cret"));
  assert.ok(!JSON.stringify(c).includes("s3cret"));
  assert.equal(c.password, undefined);
  assert.equal(c.clientId, "cid");
});

test("constructor requires credentials", () => {
  assert.throws(() => new Client({ ...creds, password: "" }), TypeError);
});

test("times out a hanging request", async () => {
  // A real request keeps the event loop alive; AbortSignal.timeout does not.
  globalThis.fetch = (url, { signal }) =>
    new Promise((_, reject) => {
      const keepAlive = setTimeout(() => {}, 5_000);
      signal.addEventListener("abort", () => {
        clearTimeout(keepAlive);
        reject(signal.reason);
      });
    });
  const c = new Client({ ...creds, timeoutMs: 20 });
  await assert.rejects(c.getPaymentDetails("p"), { name: "TimeoutError" });
});

test("currency alpha codes are sent as ISO numeric codes", async () => {
  mockFetch({ PaymentID: "p", ResponseCode: 1 });
  const c = new Client(creds);
  const base = {
    orderID: 1,
    amount: 10,
    description: "d",
    backURL: "https://x",
    opaque: "",
  };
  await c.initPayment({ ...base, currency: "AMD" });
  await c.initPayment({ ...base, currency: "840" });
  await c.initPayment(base);
  assert.equal(calls[0].body.Currency, "051");
  assert.equal(calls[1].body.Currency, "840");
  assert.equal("Currency" in calls[2].body, false);
  await assert.rejects(c.initPayment({ ...base, currency: "GBP" }), TypeError);
});

test("Armenian is sent as lang=am", () => {
  const c = new Client(creds);
  assert.match(c.getUrl("p", "hy"), /lang=am$/);
  assert.match(c.getUrl("p", "am"), /lang=am$/);
});

test("initPayment forwards Timeout; new payment types and SSNCheck", async () => {
  mockFetch({ PaymentID: "p", ResponseCode: 1, Status: "OK", Message: "" });
  const c = new Client(creds);
  await c.initPayment({
    orderID: 1,
    amount: 10,
    description: "d",
    backURL: "https://x",
    opaque: "",
    timeout: 600,
  });
  assert.equal(calls[0].body.Timeout, 600);
  await c.getBindings("Amex");
  assert.equal(calls[1].body.PaymentType, 17);
  await c.ssnCheck("p", "1234567890", 1);
  assert.match(calls[2].url, /\/api\/VPOS\/SSNCheck$/);
  assert.equal(calls[2].body.SSN, "1234567890");
  assert.equal(calls[2].body.IdentifierType, 1);
});
