import { ameria } from "./client.js";

const result = await ameria.refundPayment("PAYMENT-ID", 5); // partial refund

if (result.ResponseCode !== "00") {
  console.error("Refund failed:", result.ResponseMessage);
}
