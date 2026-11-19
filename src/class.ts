import type {
  IGetPaymentIdBody,
  IGetPaymentIdResponse,
  IInitPaymentResponse,
  IInitPaymentBody,
  IPaymentDetailsBody,
  IPaymentDetailsResponse,
  IGetPendingTransactionsBody,
  TGetPendingTransactionsResponse,
  IGetCardBindingsResponse,
  IActivateBindingResponse,
  IDeactivateBindingResponse,
  IRefundPaymentResponse,
  IRefundPaymentBody,
  ICancelPaymentResponse,
  ICancelPaymentBody,
  IGetBindingsBody,
  TPaymentEnum,
  IActivateBindingBody,
  IDeactivateBindingBody,
  IMakeBindingPaymentBody,
  IConfirmPaymentBody,
  IConfirmPaymentResponse,
  IMakeBindingPaymentResponse,
  ISSNCheckBody,
  ISSNCheckResponse,
  TCurrency,
  TCurrencyCode,
  TSSNIdentifierType,
} from "./types.js";
import { AmeriaClient, type AmeriaClientParams } from "./client.js";
import PaymentTypes from "./payment-types.js";

function paymentTypeCode(name: keyof typeof PaymentTypes): TPaymentEnum {
  const code = PaymentTypes[name];
  if (code === undefined) {
    throw new TypeError(`Unknown payment type "${String(name)}"`);
  }
  return code;
}

const CURRENCY_CODES: Record<TCurrency, TCurrencyCode> = {
  AMD: "051",
  EUR: "978",
  USD: "840",
  RUB: "643",
  "051": "051",
  "978": "978",
  "840": "840",
  "643": "643",
};

function currencyCode(currency?: TCurrency): TCurrencyCode | undefined {
  if (currency === undefined) return undefined;
  const code = CURRENCY_CODES[currency];
  if (!code) throw new TypeError(`Unsupported currency "${currency}"`);
  return code;
}

function assertAmount(amount: number): void {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    throw new RangeError(`Amount must be a positive number, got ${amount}`);
  }
}

/**
 * Client for the Ameriabank vPOS REST API.
 *
 * @example
 * ```ts
 * import { Client } from "@ameria/vpos-sdk";
 *
 * const ameria = new Client({
 *   clientId: process.env.AMERIA_CLIENT_ID!,
 *   username: process.env.AMERIA_USERNAME!,
 *   password: process.env.AMERIA_PASSWORD!,
 *   isTest: true,
 * });
 * ```
 */
export class Client extends AmeriaClient {
  constructor(params: AmeriaClientParams) {
    super(params);
  }

  /**
   * Build the bank's payment page URL for a payment ID.
   * {@link Client.initPayment} already returns it as `url`.
   */
  getUrl(paymentID: string, lang?: IInitPaymentParams["lang"]) {
    const url = new URL(`${this.host}/Payments/Pay`);
    url.searchParams.set("id", paymentID);
    // The bank's code for Armenian is "am"; "hy" is accepted for compatibility.
    if (lang) url.searchParams.set("lang", lang === "hy" ? "am" : lang);
    return url.toString();
  }

  /**
   * Register a payment and get the URL of the bank's card page.
   *
   * Redirect the payer to `url`. After paying they come back to `backURL`;
   * that redirect is not signed, so confirm the result with
   * {@link Client.getPaymentDetails} before fulfilling the order.
   *
   * @returns The bank's response plus `url`, which is `null` unless
   * `ResponseCode` is `1`.
   */
  async initPayment(
    params: IInitPaymentParams,
  ): Promise<IInitPaymentResponse & { url: string | null }> {
    assertAmount(params.amount);
    const body: IInitPaymentBody = {
      OrderID: params.orderID,
      Amount: params.amount,
      Description: params.description,
      BackURL: params.backURL,
      CardHolderID: params.cardHolderId,
      Currency: currencyCode(params.currency),
      Opaque: params.opaque,
      Timeout: params.timeout,
      PaymentServiceType: params.paymentServiceType,
    };

    const data: IInitPaymentResponse = await this.ameriaFetch(
      "InitPayment",
      body,
    );

    const { PaymentID, ResponseCode } = data;

    const url = ResponseCode === 1 ? this.getUrl(PaymentID, params.lang) : null;

    return { ...data, url };
  }

  /** Look up the bank's payment ID for one of your order IDs. */
  async getPaymentId(orderId: string | number): Promise<IGetPaymentIdResponse> {
    const body: IGetPaymentIdBody = {
      OrderID: orderId,
    };

    return this.ameriaFetch("GetPaymentId", body);
  }

  /**
   * Deposit a payment that was only approved (two-step payments).
   * @param amount Amount to deposit; up to the approved amount.
   */
  async confirmPayment(
    paymentId: string,
    amount: number,
  ): Promise<IConfirmPaymentResponse> {
    assertAmount(amount);
    const body: IConfirmPaymentBody = {
      PaymentID: paymentId,
      Amount: amount,
    };

    return this.ameriaFetch("ConfirmPayment", body);
  }

  /**
   * Get the status and details of a payment. This is the only reliable way
   * to know whether a payment succeeded: check `ResponseCode === "00"`.
   */
  async getPaymentDetails(paymentId: string): Promise<IPaymentDetailsResponse> {
    const body: IPaymentDetailsBody = {
      PaymentID: paymentId,
    };

    return this.ameriaFetch("GetPaymentDetails", body);
  }

  /** List transactions that were started but not completed in a date range. */
  async getPendingTransactions(
    params: IGetPendingTransactionsParams,
  ): Promise<TGetPendingTransactionsResponse> {
    const body: IGetPendingTransactionsBody = {
      StartDate: params.startDate.toISOString(),
      EndDate: params.endDate.toISOString(),
    };

    return this.ameriaFetch("GetPendingTransactions", body);
  }

  /**
   * Refund a completed payment, fully or partly.
   * @param amount Amount to refund; up to the deposited amount.
   */
  async refundPayment(
    paymentId: string,
    amount: number,
  ): Promise<IRefundPaymentResponse> {
    assertAmount(amount);
    const body: IRefundPaymentBody = {
      PaymentID: paymentId,
      Amount: amount,
    };

    return this.ameriaFetch("RefundPayment", body);
  }

  /**
   * Cancel (reverse) a payment. For two-step payments this releases an
   * approved amount that was never confirmed.
   */
  async cancelPayment(paymentId: string): Promise<ICancelPaymentResponse> {
    const body: ICancelPaymentBody = {
      PaymentID: paymentId,
    };

    return this.ameriaFetch("CancelPayment", body);
  }

  /** List the saved cards (bindings) of your merchant account. */
  async getBindings(
    paymentType: keyof typeof PaymentTypes,
  ): Promise<IGetCardBindingsResponse> {
    const num = paymentTypeCode(paymentType);

    const body: IGetBindingsBody = {
      PaymentType: num,
    };

    return this.ameriaFetch("GetBindings", body);
  }

  /** Re-enable a saved card that was deactivated. */
  async activateBinding(
    cardHolderId: string,
    paymentType: keyof typeof PaymentTypes,
  ): Promise<IActivateBindingResponse> {
    const num = paymentTypeCode(paymentType);

    const body: IActivateBindingBody = {
      CardHolderID: cardHolderId,
      PaymentType: num,
    };

    return this.ameriaFetch("ActivateBinding", body);
  }

  /** Disable a saved card so it can no longer be charged. */
  async deactivateBinding(
    cardHolderId: string,
    paymentType: keyof typeof PaymentTypes,
  ): Promise<IDeactivateBindingResponse> {
    const num = paymentTypeCode(paymentType);

    const body: IDeactivateBindingBody = {
      CardHolderID: cardHolderId,
      PaymentType: num,
    };

    return this.ameriaFetch("DeactivateBinding", body);
  }

  /**
   * Charge a saved card without the payer entering card details.
   *
   * If the response has `AcsUrl` set, the card issuer requires 3-D Secure
   * and the payment is not complete until the payer passes it.
   */
  async makeBindingPayment(
    params: IMakeBindingPaymentParams,
  ): Promise<IMakeBindingPaymentResponse> {
    assertAmount(params.amount);
    const num = paymentTypeCode(params.paymentType ?? "BindingMainRest");
    const body: IMakeBindingPaymentBody = {
      CardHolderID: params.cardHolderID,
      Amount: params.amount,
      OrderID: params.orderID,
      BackURL: params.backURL,
      PaymentType: num,
      Description: params.description,
      Currency: currencyCode(params.currency),
      Opaque: params.opaque,
    };

    return this.ameriaFetch("MakeBindingPayment", body);
  }

  /**
   * Submit the payer's national identifier for a payment (SSNCheck).
   * The identifier is personal data: do not log it.
   */
  async ssnCheck(
    paymentId: string,
    ssn: string,
    identifierType: TSSNIdentifierType,
  ): Promise<ISSNCheckResponse> {
    const body: ISSNCheckBody = {
      PaymentID: paymentId,
      SSN: ssn,
      IdentifierType: identifierType,
    };
    return this.ameriaFetch("SSNCheck", body);
  }
}

/** Parameters of {@link Client.initPayment}. */
export interface IInitPaymentParams {
  /** Your order ID. In the test environment it must be in the range the bank gave you. */
  orderID: number | string;
  /** Amount in the payment currency. The test environment only accepts 10 AMD. */
  amount: number;
  /** Defaults to AMD. Alphabetic codes are converted to ISO numeric codes. */
  currency?: TCurrency;
  /** Shown to the payer on the payment page. */
  description: string;
  /** Where the bank sends the payer after the payment page. */
  backURL: string;
  /** Free text returned to you with the payment. */
  opaque: string;
  /** Set to save the card for later {@link Client.makeBindingPayment} charges. */
  cardHolderId?: string;
  /** Payment page language. "hy" is sent as "am", the bank's code for Armenian. */
  lang?: "en" | "am" | "hy" | "ru";
  /** Seconds the payment page stays valid. */
  timeout?: number;
  /** Passed to the bank as-is; the bank does not document its values. */
  paymentServiceType?: number;
}

/** Parameters of {@link Client.getPendingTransactions}. */
export interface IGetPendingTransactionsParams {
  startDate: Date;
  endDate: Date;
}

/** Parameters of {@link Client.makeBindingPayment}. */
export interface IMakeBindingPaymentParams {
  amount: number;
  backURL: string;
  /** The `cardHolderId` you passed to {@link Client.initPayment} when the card was saved. */
  cardHolderID: string;
  currency?: TCurrency;
  description: string;
  opaque: string;
  orderID: number;
  /** Defaults to "BindingMainRest". */
  paymentType?: keyof typeof PaymentTypes;
}
