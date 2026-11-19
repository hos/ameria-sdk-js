import { ameria } from "./client.js";

const payment = await ameria.initPayment({
  orderID: 2350301, // in test, use an ID from the range the bank gave you
  amount: 10, // the test environment only accepts 10 AMD
  currency: "AMD",
  description: "Order #1042",
  backURL: "https://shop.example/payment/back",
  opaque: "order-1042",
  lang: "en",
});

if (payment.url) {
  // Send the payer to the bank's card page.
  console.log("Redirect to", payment.url);
} else {
  console.error("Bank refused:", payment.ResponseMessage);
}
