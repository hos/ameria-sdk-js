import { AmeriaHttpError, RESPONSE_CODES } from "@ameria/vpos-sdk";
import { ameria } from "./client.js";

try {
  const details = await ameria.getPaymentDetails("PAYMENT-ID");
  if (details.ResponseCode !== "00") {
    // A business decline: look up what the code means.
    const reason = RESPONSE_CODES[details.ResponseCode];
    console.log(details.ResponseCode, reason?.description);
  }
} catch (error) {
  if (error instanceof AmeriaHttpError) {
    // The bank answered with an HTTP error or a non-JSON page.
    console.error(error.endpoint, error.status, error.body);
  } else if (error instanceof Error && error.name === "TimeoutError") {
    // No answer within timeoutMs (30 s by default). The payment state is
    // unknown: check it again with getPaymentDetails before retrying.
  } else {
    throw error;
  }
}
