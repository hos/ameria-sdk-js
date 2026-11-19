import { ameria } from "./client.js";

// 1. First payment: pass cardHolderId so the bank saves the card.
await ameria.initPayment({
  orderID: 2350302,
  amount: 10,
  description: "Subscription, first month",
  backURL: "https://shop.example/payment/back",
  opaque: "",
  cardHolderId: "customer-77",
});

// 2. Later payments: charge the saved card, no payer interaction.
const charge = await ameria.makeBindingPayment({
  cardHolderID: "customer-77",
  orderID: 2350303,
  amount: 10,
  description: "Subscription, second month",
  backURL: "https://shop.example/payment/back",
  opaque: "",
});

if (charge.AcsUrl) {
  // The issuer wants 3-D Secure: the payer has to confirm this payment.
  console.log("Send the payer to", charge.AcsUrl);
} else if (charge.ResponseCode === "00") {
  console.log("Charged", charge.Amount);
}

// List, disable and re-enable saved cards.
const { CardBindingFileds: cards } =
  await ameria.getBindings("BindingMainRest");
console.log(cards.map((c) => c.CardPan));
await ameria.deactivateBinding("customer-77", "BindingMainRest");
await ameria.activateBinding("customer-77", "BindingMainRest");
