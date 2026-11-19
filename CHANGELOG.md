# Changelog

## 0.1.0

First release since 2021. Breaking — see the
[upgrade guide](https://hos.github.io/ameria-sdk-js/migration/).

- ESM-only; requires Node.js 22.12+ (`require()` still works there).
- `Client` renamed to `AmeriaClient` (`Client` kept as a deprecated alias).
- Options are camelCase: `orderId`, `backUrl`, `cardHolderId`. Type names lost their
  `I`/`T` prefixes.
- HTTP errors throw `AmeriaHttpError`; requests time out after 30 s.
- Credentials are no longer readable from the client object.
- Currency is sent as the ISO numeric code; `lang: "hy"` is sent as `am`.
- Added `verifyPayment`, a `fetch` option, `ssnCheck`, new payment types (MirCard,
  ApplePay, EPGCardApplePay, Amex) and 3-D Secure fields on `makeBindingPayment`.
- Fixed the payment page language, `getPendingTransactions` dates,
  `getBindings("None")` and the `getPaymentId` return type.
- Dropped `node-fetch`; no runtime dependencies.
