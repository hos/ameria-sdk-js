# Ameria vPOS SDK

Unofficial TypeScript SDK for the [Ameriabank vPOS](https://ameriabank.am) payment API.
Accept card payments, refunds, two-step payments and saved cards from Node.js.

**Docs:** https://hos.github.io/ameria-sdk-js/

```sh
npm install @ameria/vpos-sdk
```

```ts
import { Client } from "@ameria/vpos-sdk";

const ameria = new Client({
  clientId: process.env.AMERIA_CLIENT_ID!,
  username: process.env.AMERIA_USERNAME!,
  password: process.env.AMERIA_PASSWORD!,
  isTest: true,
});

// Register the payment and send the payer to the bank's card page.
const { url, PaymentID } = await ameria.initPayment({
  orderID: 2350301,
  amount: 10,
  currency: "AMD",
  description: "Order #1042",
  backURL: "https://shop.example/payment/back",
  opaque: "order-1042",
});

// When they come back, ask the bank whether it really succeeded.
const details = await ameria.getPaymentDetails(PaymentID);
if (details.ResponseCode === "00") {
  // fulfil the order
}
```

> [!IMPORTANT]
> The redirect to `backURL` is not signed. Always confirm the payment with
> `getPaymentDetails` and check the amount before fulfilling an order.

## Requirements

- Node.js 22.12 or newer. The package is ESM-only; `require("@ameria/vpos-sdk")`
  also works on these versions.
- No runtime dependencies — it uses the built-in `fetch`.

## Development

```sh
yarn install
yarn test        # build and run the tests
yarn lint        # ESLint, Prettier, publint
yarn docs:dev    # docs site on http://localhost:4321/ameria-sdk-js/
```

## License

MIT
