# Ameria vPOS SDK

Unofficial TypeScript SDK for the [Ameriabank vPOS](https://ameriabank.am) payment API.
Accept card payments, refunds, two-step payments and saved cards from Node.js.

**Docs:** https://hos.github.io/ameria-sdk-js/ · for AI tools:
[llms.txt](https://hos.github.io/ameria-sdk-js/llms.txt)

```sh
npm install @ameria/vpos-sdk
```

```ts
import { AmeriaClient } from "@ameria/vpos-sdk";

const ameria = new AmeriaClient({
  clientId: process.env.AMERIA_CLIENT_ID!,
  username: process.env.AMERIA_USERNAME!,
  password: process.env.AMERIA_PASSWORD!,
  isTest: true,
});

// Register the payment and send the payer to the bank's card page.
const { url, PaymentID } = await ameria.initPayment({
  orderId: 2350301,
  amount: 10,
  currency: "AMD",
  description: "Order #1042",
  backUrl: "https://shop.example/payment/back",
  opaque: "order-1042",
});

// When they come back, ask the bank whether it really succeeded.
const { paid } = await ameria.verifyPayment(PaymentID, {
  amount: 10,
  currency: "AMD",
  orderId: 2350301,
});
if (paid) {
  // fulfil the order
}
```

> [!IMPORTANT]
> The redirect to `backUrl` is not signed. Always confirm the payment with
> `verifyPayment` before fulfilling an order.

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
