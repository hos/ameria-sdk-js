# ameria-sdk-js

The unofficial vPOS SDK for Ameriabank.

Requires Node.js 18 or later (uses the built-in `fetch`). No runtime dependencies.

```ts
import { Client } from "@ameria/vpos-sdk";

const ameria = new Client({
  clientId: process.env.AMERIA_CLIENT_ID!,
  username: process.env.AMERIA_USERNAME!,
  password: process.env.AMERIA_PASSWORD!,
  isTest: true,
});

const { url } = await ameria.initPayment({
  orderID: 2350301, // test order IDs must be in the range the bank gave you
  amount: 10, // the test environment only accepts 10 AMD
  currency: "AMD", // sent as ISO numeric "051"
  description: "Order #1",
  backURL: "https://example.com/payment/back",
  opaque: "",
  lang: "en",
});
// redirect the payer to `url`
```

Requests time out after 30 seconds (`timeoutMs` to change it). A non-2xx or non-JSON
answer from the bank throws `AmeriaHttpError`; business errors come back in `ResponseCode`.

### Security

- **Never trust the BackURL redirect.** The bank does not sign it, so anyone can open your
  BackURL with `resposneCode=00`. Always call `getPaymentDetails(paymentID)` and check
  `ResponseCode === "00"`, the amount and the order before fulfilling.
- Keep credentials in environment variables or a secret store. The client holds them in
  private fields, so logging the client object does not print them.
- `ssnCheck` sends a national ID number; do not log its arguments.
- A binding payment can come back with `AcsUrl` set, meaning the card issuer wants 3-D Secure;
  the payment is not complete until the payer passes it.

<br/>
<br/>
<br/>

### 2 Step Payments

This feature will allow you to first approve payment and then deposit it. To use this in test environment, you need
to contact technical support team in Ameria Bank and request to change API client settings. To use this in production
you need to send application to Ameria Bank using mobile/internet banking. You will send application to change you API client,
to **always** use 2 step payments. So after bank will approve you application, you can't use one step payment anymore.
Instead you will have to request another client and use 2 clients if you want to use both options simultaneously.
As soon as Ameria Bank changes you API `initPayment` will approve payment but will not deposit it. You will have to use
`confirmPayment` to deposit or `cancelPayment` to cancel it.

<br/>
<br/>
<br/>

### Binding Transactions

is a way to withdraw money from credit card without user interaction. This can be
used for recurring payments, subscriptions or just to save user's payment method instead of requiring it
every time user willing to make a payment.

To start using binding transactions, first, authorized person, (usually the director of the company) must
send an application using mobile/internet banking and wait until the Bank will approve it.
