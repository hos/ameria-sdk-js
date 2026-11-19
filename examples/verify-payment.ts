import { ameria } from "./client.js";

/**
 * Handle the payer coming back to your backUrl.
 * The query string is not signed: never trust it, ask the bank instead.
 */
export async function handleBackUrl(
  url: URL,
  order: { id: number; total: number },
) {
  const paymentId = url.searchParams.get("paymentID");
  if (!paymentId) return false;

  const { paid, reason } = await ameria.verifyPayment(paymentId, {
    amount: order.total,
    currency: "AMD",
    orderId: order.id,
  });

  if (!paid) console.warn(`Order ${order.id} not paid: ${reason}`);
  return paid;
}
