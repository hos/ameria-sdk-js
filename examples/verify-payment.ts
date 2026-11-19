import { ameria } from "./client.js";

/**
 * Handle the payer coming back to your BackURL.
 * The query string is not signed: never trust it, ask the bank instead.
 */
export async function handleBackUrl(url: URL, expectedAmount: number) {
  const paymentID = url.searchParams.get("paymentID");
  if (!paymentID) return { paid: false };

  const details = await ameria.getPaymentDetails(paymentID);
  const paid =
    details.ResponseCode === "00" && details.Amount === expectedAmount;

  return { paid, orderID: details.OrderID, card: details.CardNumber };
}
