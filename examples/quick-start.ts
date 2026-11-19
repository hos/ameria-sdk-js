import { Client } from "@ameria/vpos-sdk";

const ameria = new Client({
  clientId: process.env.AMERIA_CLIENT_ID!,
  username: process.env.AMERIA_USERNAME!,
  password: process.env.AMERIA_PASSWORD!,
  isTest: true,
});

// 1. Register the payment and send the payer to the bank's card page.
const { url, PaymentID } = await ameria.initPayment({
  orderID: 2350301,
  amount: 10,
  currency: "AMD",
  description: "Order #1042",
  backURL: "https://shop.example/payment/back",
  opaque: "order-1042",
});
console.log("Redirect the payer to", url);

// 2. When they come back, ask the bank whether it really succeeded.
const details = await ameria.getPaymentDetails(PaymentID);
if (details.ResponseCode === "00") {
  console.log("Paid", details.Amount, "— fulfil the order");
}
