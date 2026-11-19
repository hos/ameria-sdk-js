import { AmeriaClient } from "@ameria/vpos-sdk";

const ameria = new AmeriaClient({
  clientId: process.env.AMERIA_CLIENT_ID!,
  username: process.env.AMERIA_USERNAME!,
  password: process.env.AMERIA_PASSWORD!,
  isTest: true,
});

// 1. Register the payment and send the payer to the bank's card page.
const { url, PaymentID } = await ameria.initPayment({
  orderId: 2350301,
  amount: 10,
  currency: "AMD",
  description: "Order #1042",
  backUrl: "https://shop.example/payment/back",
  opaque: "order-1042",
});
console.log("Redirect the payer to", url);

// 2. The payer comes back to backUrl, but that redirect is not signed: anyone can
//    open it with a success code and skip paying. So ask the bank, and pass what
//    you expect — otherwise a real payment for a cheaper order would also pass.
const { paid, reason } = await ameria.verifyPayment(PaymentID, {
  amount: 10,
  currency: "AMD",
  orderId: 2350301,
});
console.log(paid ? "Paid — fulfil the order" : `Not paid: ${reason}`);
