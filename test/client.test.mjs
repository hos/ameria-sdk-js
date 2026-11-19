import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { inspect } from "node:util";
import { AmeriaClient, AmeriaHttpError } from "../dist/index.js";

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
  const client = new AmeriaClient({ ...creds, isTest: true });
  const res = await client.initPayment({
    orderId: 2000001,
    amount: 10,
    description: "d",
    backUrl: "https://example.com/back",
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
  const res = await new AmeriaClient(creds).initPayment({
    orderId: 1,
    amount: 5,
    description: "d",
    backUrl: "https://x",
    opaque: "",
  });
  assert.match(calls[0].url, /^https:\/\/services\.ameriabank\.am\/VPOS\//);
  assert.equal(res.url, null);
});

test("credentials are sent with every call", async () => {
  mockFetch({});
  await new AmeriaClient(creds).cancelPayment("p1");
  assert.equal(calls[0].body.Password, "s3cret");
  assert.equal(calls[0].body.PaymentID, "p1");
});

test("getUrl encodes the payment id", () => {
  const c = new AmeriaClient(creds);
  assert.equal(
    c.getUrl("a&b=c"),
    "https://services.ameriabank.am/VPOS/Payments/Pay?id=a%26b%3Dc",
  );
});

test("getPendingTransactions sends both dates", async () => {
  mockFetch([]);
  await new AmeriaClient(creds).getPendingTransactions({
    startDate: new Date("2026-01-01T00:00:00Z"),
    endDate: new Date("2026-01-31T00:00:00Z"),
  });
  assert.equal(calls[0].body.StartDate, "2026-01-01T00:00:00.000Z");
  assert.equal(calls[0].body.EndDate, "2026-01-31T00:00:00.000Z");
});

test("payment types map to codes, None (0) included", async () => {
  mockFetch({});
  const c = new AmeriaClient(creds);
  await c.getBindings("None");
  await c.activateBinding("h1", "Arca");
  await c.makeBindingPayment({
    amount: 1,
    backUrl: "https://x",
    cardHolderId: "h1",
    currency: "051",
    description: "d",
    opaque: "",
    orderId: 3,
  });
  assert.equal(calls[0].body.PaymentType, 0);
  assert.equal(calls[1].body.PaymentType, 1);
  assert.equal(calls[2].body.PaymentType, 6); // BindingMainRest default
  await assert.rejects(c.getBindings("Nope"), TypeError);
});

test("rejects invalid amounts before calling the bank", async () => {
  mockFetch({});
  const c = new AmeriaClient(creds);
  for (const amount of [0, -1, NaN, Infinity, "10"]) {
    await assert.rejects(c.refundPayment("p", amount), RangeError);
  }
  assert.equal(calls.length, 0);
});

test("non-2xx and non-JSON responses throw AmeriaHttpError", async () => {
  const c = new AmeriaClient(creds);
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
  const c = new AmeriaClient(creds);
  assert.ok(!inspect(c, { depth: 5 }).includes("s3cret"));
  assert.ok(!JSON.stringify(c).includes("s3cret"));
  assert.equal(c.password, undefined);
  assert.equal(c.clientId, "cid");
});

test("constructor requires credentials", () => {
  assert.throws(() => new AmeriaClient({ ...creds, password: "" }), TypeError);
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
  const c = new AmeriaClient({ ...creds, timeoutMs: 20 });
  await assert.rejects(c.getPaymentDetails("p"), { name: "TimeoutError" });
});

test("currency alpha codes are sent as ISO numeric codes", async () => {
  mockFetch({ PaymentID: "p", ResponseCode: 1 });
  const c = new AmeriaClient(creds);
  const base = {
    orderId: 1,
    amount: 10,
    description: "d",
    backUrl: "https://x",
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
  const c = new AmeriaClient(creds);
  assert.match(c.getUrl("p", "hy"), /lang=am$/);
  assert.match(c.getUrl("p", "am"), /lang=am$/);
});

test("initPayment forwards Timeout; new payment types and SSNCheck", async () => {
  mockFetch({ PaymentID: "p", ResponseCode: 1, Status: "OK", Message: "" });
  const c = new AmeriaClient(creds);
  await c.initPayment({
    orderId: 1,
    amount: 10,
    description: "d",
    backUrl: "https://x",
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

const paidDetails = {
  ResponseCode: "00",
  Amount: 10,
  ApprovedAmount: 10,
  DepositedAmount: 10,
  RefundedAmount: 0,
  Currency: "051",
  OrderID: "2350301",
};

test("verifyPayment: paid only when every check passes", async () => {
  const c = new AmeriaClient(creds);
  const expected = { amount: 10, currency: "AMD", orderId: 2350301 };
  const cases = [
    [{}, { paid: true }],
    [{ ResponseCode: "0-2006" }, { paid: false, reason: "declined" }],
    [{ Amount: 1 }, { paid: false, reason: "amount_mismatch" }],
    [{ Currency: "840" }, { paid: false, reason: "currency_mismatch" }],
    [{ OrderID: "999" }, { paid: false, reason: "order_mismatch" }],
    [{ RefundedAmount: 10 }, { paid: false, reason: "refunded" }],
    [{ DepositedAmount: 0 }, { paid: false, reason: "not_completed" }],
  ];
  for (const [override, want] of cases) {
    mockFetch({ ...paidDetails, ...override });
    const { paid, reason } = await c.verifyPayment("p", expected);
    assert.deepEqual({ paid, reason }, { reason: undefined, ...want });
  }
  assert.equal(calls[0].body.PaymentID, "p");
});

test("verifyPayment: twoStep accepts an approved, undeposited payment", async () => {
  mockFetch({ ...paidDetails, DepositedAmount: 0 });
  const c = new AmeriaClient(creds);
  const r = await c.verifyPayment("p", { amount: 10, twoStep: true });
  assert.equal(r.paid, true);
});

test("uses the fetch passed in options", async () => {
  let used = false;
  const c = new AmeriaClient({
    ...creds,
    fetch: async () => {
      used = true;
      return Response.json({ Status: "OK", Message: "" });
    },
  });
  await c.ssnCheck("p", "123", 1);
  assert.equal(used, true);
});

test("Client is a deprecated alias of AmeriaClient", async () => {
  const { Client } = await import("../dist/index.js");
  assert.equal(Client, AmeriaClient);
});
