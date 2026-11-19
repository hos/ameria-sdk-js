import { ameria } from "./client.js";

// With two-step payments enabled on your account, initPayment only
// approves (holds) the amount. Later you either deposit it...
await ameria.confirmPayment("PAYMENT-ID", 10);

// ...or release the hold.
await ameria.cancelPayment("PAYMENT-ID");
