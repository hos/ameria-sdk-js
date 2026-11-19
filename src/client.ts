import type {
  ActivateBindingResponse,
  AmeriaEndpoint,
  CancelPaymentResponse,
  ConfirmPaymentResponse,
  Currency,
  CurrencyCode,
  DeactivateBindingResponse,
  GetBindingsResponse,
  GetPaymentIdResponse,
  GetPendingTransactionsResponse,
  InitPaymentResponse,
  MakeBindingPaymentResponse,
  PaymentDetailsResponse,
  PaymentTypeCode,
  RefundPaymentResponse,
  SsnCheckResponse,
  SsnIdentifierType,
} from "./types.js";
import type {
  ActivateBindingBody,
  CancelPaymentBody,
  ConfirmPaymentBody,
  DeactivateBindingBody,
  GetBindingsBody,
  GetPaymentIdBody,
  GetPendingTransactionsBody,
  InitPaymentBody,
  MakeBindingPaymentBody,
  PaymentDetailsBody,
  RefundPaymentBody,
  SsnCheckBody,
} from "./wire.js";
import { AmeriaHttpError } from "./errors.js";
import PaymentTypes, { type PaymentType } from "./payment-types.js";

const HOST = "https://services.ameriabank.am/VPOS";
const TEST_HOST = "https://servicestest.ameriabank.am/VPOS";
const DEFAULT_TIMEOUT_MS = 30_000;

const CURRENCY_CODES: Record<Currency, CurrencyCode> = {
  AMD: "051",
  EUR: "978",
  USD: "840",
  RUB: "643",
  "051": "051",
  "978": "978",
  "840": "840",
  "643": "643",
};

function currencyCode(currency?: Currency): CurrencyCode | undefined {
  if (currency === undefined) return undefined;
  const code = CURRENCY_CODES[currency];
  if (!code) throw new TypeError(`Unsupported currency "${currency}"`);
  return code;
}

function paymentTypeCode(name: PaymentType): PaymentTypeCode {
  const code = PaymentTypes[name];
  if (code === undefined) {
    throw new TypeError(`Unknown payment type "${String(name)}"`);
  }
  return code;
}

function assertAmount(amount: number): void {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    throw new RangeError(`Amount must be a positive number, got ${amount}`);
  }
}

/** Options for {@link AmeriaClient}. */
export interface AmeriaClientParams {
  /** Client ID issued by Ameriabank. */
  clientId: string;
  username: string;
  password: string;
  /** Use the bank's test environment (servicestest.ameriabank.am). */
  isTest?: boolean;
  /** Abort a request to the bank after this many milliseconds. Default 30000. */
  timeoutMs?: number;
  /**
   * `fetch` implementation to use, e.g. one that goes through a proxy.
   * Defaults to the global `fetch`.
   */
  fetch?: typeof globalThis.fetch;
}

/**
 * Client for the Ameriabank vPOS REST API.
 *
 * @example
 * ```ts
 * import { AmeriaClient } from "@ameria/vpos-sdk";
 *
 * const ameria = new AmeriaClient({
 *   clientId: process.env.AMERIA_CLIENT_ID!,
 *   username: process.env.AMERIA_USERNAME!,
 *   password: process.env.AMERIA_PASSWORD!,
 *   isTest: true,
 * });
 * ```
 */
export class AmeriaClient {
  // Credentials live in true private fields so they never show up in
  // console.log(client), JSON.stringify(client) or error reporters.
  readonly #clientId: string;
  readonly #username: string;
  readonly #password: string;
  readonly #timeoutMs: number;
  readonly #fetch: typeof globalThis.fetch | undefined;
  /** Base URL of the bank API this client talks to. */
  readonly host: string;

  constructor(params: AmeriaClientParams) {
    for (const key of ["clientId", "username", "password"] as const) {
      if (typeof params[key] !== "string" || params[key] === "") {
        throw new TypeError(`AmeriaClient: "${key}" is required`);
      }
    }
    this.#clientId = params.clientId;
    this.#username = params.username;
    this.#password = params.password;
    this.#timeoutMs = params.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.#fetch = params.fetch;
    this.host = params.isTest ? TEST_HOST : HOST;
  }

  /** The client ID this client was created with. */
  get clientId(): string {
    return this.#clientId;
  }

  async #request<T>(endpoint: AmeriaEndpoint, body: object): Promise<T> {
    const fetchImpl = this.#fetch ?? globalThis.fetch;
    const response = await fetchImpl(`${this.host}/api/VPOS/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ...body,
        ClientID: this.#clientId,
        Username: this.#username,
        Password: this.#password,
      }),
      redirect: "error",
      signal: AbortSignal.timeout(this.#timeoutMs),
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !contentType.startsWith("application/json")) {
      throw new AmeriaHttpError(
        endpoint,
        response.status,
        await response.text(),
      );
    }
    return (await response.json()) as T;
  }

  /**
   * Build the bank's payment page URL for a payment ID.
   * {@link AmeriaClient.initPayment} already returns it as `url`.
   */
  getUrl(paymentId: string, lang?: InitPaymentParams["lang"]): string {
    const url = new URL(`${this.host}/Payments/Pay`);
    url.searchParams.set("id", paymentId);
    // The bank's code for Armenian is "am"; "hy" is accepted for compatibility.
    if (lang) url.searchParams.set("lang", lang === "hy" ? "am" : lang);
    return url.toString();
  }

  /**
   * Register a payment and get the URL of the bank's card page.
   *
   * Redirect the payer to `url`. After paying they come back to `backUrl`;
   * that redirect is not signed, so confirm the result with
   * {@link AmeriaClient.verifyPayment} before fulfilling the order.
   *
   * @returns The bank's response plus `url`, which is `null` unless
   * `ResponseCode` is `1`.
   */
  async initPayment(
    params: InitPaymentParams,
  ): Promise<InitPaymentResponse & { url: string | null }> {
    assertAmount(params.amount);
    const body: InitPaymentBody = {
      OrderID: params.orderId,
      Amount: params.amount,
      Description: params.description,
      BackURL: params.backUrl,
      CardHolderID: params.cardHolderId,
      Currency: currencyCode(params.currency),
      Opaque: params.opaque,
      Timeout: params.timeout,
      PaymentServiceType: params.paymentServiceType,
    };

    const data = await this.#request<InitPaymentResponse>("InitPayment", body);
    const url =
      data.ResponseCode === 1 ? this.getUrl(data.PaymentID, params.lang) : null;
    return { ...data, url };
  }

  /** Look up the bank's payment ID for one of your order IDs. */
  async getPaymentId(orderId: string | number): Promise<GetPaymentIdResponse> {
    const body: GetPaymentIdBody = { OrderID: orderId };
    return this.#request("GetPaymentId", body);
  }

  /**
   * Deposit a payment that was only approved (two-step payments).
   * @param amount Amount to deposit; up to the approved amount.
   */
  async confirmPayment(
    paymentId: string,
    amount: number,
  ): Promise<ConfirmPaymentResponse> {
    assertAmount(amount);
    const body: ConfirmPaymentBody = { PaymentID: paymentId, Amount: amount };
    return this.#request("ConfirmPayment", body);
  }

  /**
   * Get the raw status and details of a payment. To decide whether to
   * fulfil an order, prefer {@link AmeriaClient.verifyPayment}.
   */
  async getPaymentDetails(paymentId: string): Promise<PaymentDetailsResponse> {
    const body: PaymentDetailsBody = { PaymentID: paymentId };
    return this.#request("GetPaymentDetails", body);
  }

  /**
   * Ask the bank whether a payment really succeeded for the amount you
   * expect. Use it when the payer comes back to your `backUrl`: that
   * redirect is not signed and can be forged.
   *
   * `paid` is `true` only if the bank approved the payment, the amount,
   * currency and order ID match what you expect, the money was deposited
   * (or, with `twoStep`, approved) and nothing was refunded.
   *
   * @example
   * ```ts
   * const { paid, reason } = await ameria.verifyPayment(paymentId, {
   *   amount: order.total,
   *   currency: "AMD",
   *   orderId: order.id,
   * });
   * if (paid) await fulfil(order);
   * ```
   */
  async verifyPayment(
    paymentId: string,
    expected: VerifyPaymentExpected,
  ): Promise<PaymentVerification> {
    const details = await this.getPaymentDetails(paymentId);
    const fail = (reason: PaymentVerification["reason"]) => ({
      paid: false,
      reason,
      details,
    });

    if (details.ResponseCode !== "00") return fail("declined");
    if (!sameAmount(details.Amount, expected.amount)) {
      return fail("amount_mismatch");
    }
    const want = currencyCode(expected.currency ?? "AMD");
    const got = CURRENCY_CODES[details.Currency as Currency];
    if (got !== want) return fail("currency_mismatch");
    if (
      expected.orderId !== undefined &&
      String(details.OrderID) !== String(expected.orderId)
    ) {
      return fail("order_mismatch");
    }
    if (details.RefundedAmount > 0) return fail("refunded");
    const settled = expected.twoStep
      ? details.ApprovedAmount
      : details.DepositedAmount;
    if (!(settled >= expected.amount - 0.005)) return fail("not_completed");

    return { paid: true, details };
  }

  /** List transactions that were started but not completed in a date range. */
  async getPendingTransactions(
    params: GetPendingTransactionsParams,
  ): Promise<GetPendingTransactionsResponse> {
    const body: GetPendingTransactionsBody = {
      StartDate: params.startDate.toISOString(),
      EndDate: params.endDate.toISOString(),
    };
    return this.#request("GetPendingTransactions", body);
  }

  /**
   * Refund a completed payment, fully or partly.
   * @param amount Amount to refund; up to the deposited amount.
   */
  async refundPayment(
    paymentId: string,
    amount: number,
  ): Promise<RefundPaymentResponse> {
    assertAmount(amount);
    const body: RefundPaymentBody = { PaymentID: paymentId, Amount: amount };
    return this.#request("RefundPayment", body);
  }

  /**
   * Cancel (reverse) a payment. For two-step payments this releases an
   * approved amount that was never confirmed.
   */
  async cancelPayment(paymentId: string): Promise<CancelPaymentResponse> {
    const body: CancelPaymentBody = { PaymentID: paymentId };
    return this.#request("CancelPayment", body);
  }

  /** List the saved cards (bindings) of your merchant account. */
  async getBindings(paymentType: PaymentType): Promise<GetBindingsResponse> {
    const body: GetBindingsBody = { PaymentType: paymentTypeCode(paymentType) };
    return this.#request("GetBindings", body);
  }

  /** Re-enable a saved card that was deactivated. */
  async activateBinding(
    cardHolderId: string,
    paymentType: PaymentType,
  ): Promise<ActivateBindingResponse> {
    const body: ActivateBindingBody = {
      CardHolderID: cardHolderId,
      PaymentType: paymentTypeCode(paymentType),
    };
    return this.#request("ActivateBinding", body);
  }

  /** Disable a saved card so it can no longer be charged. */
  async deactivateBinding(
    cardHolderId: string,
    paymentType: PaymentType,
  ): Promise<DeactivateBindingResponse> {
    const body: DeactivateBindingBody = {
      CardHolderID: cardHolderId,
      PaymentType: paymentTypeCode(paymentType),
    };
    return this.#request("DeactivateBinding", body);
  }

  /**
   * Charge a saved card without the payer entering card details.
   *
   * If the response has `AcsUrl` set, the card issuer requires 3-D Secure
   * and the payment is not complete until the payer passes it.
   */
  async makeBindingPayment(
    params: MakeBindingPaymentParams,
  ): Promise<MakeBindingPaymentResponse> {
    assertAmount(params.amount);
    const body: MakeBindingPaymentBody = {
      CardHolderID: params.cardHolderId,
      Amount: params.amount,
      OrderID: params.orderId,
      BackURL: params.backUrl,
      PaymentType: paymentTypeCode(params.paymentType ?? "BindingMainRest"),
      Description: params.description,
      Currency: currencyCode(params.currency),
      Opaque: params.opaque,
    };
    return this.#request("MakeBindingPayment", body);
  }

  /**
   * Submit the payer's national identifier for a payment (SSNCheck).
   * The identifier is personal data: do not log it.
   */
  async ssnCheck(
    paymentId: string,
    ssn: string,
    identifierType: SsnIdentifierType,
  ): Promise<SsnCheckResponse> {
    const body: SsnCheckBody = {
      PaymentID: paymentId,
      SSN: ssn,
      IdentifierType: identifierType,
    };
    return this.#request("SSNCheck", body);
  }
}

function sameAmount(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.005;
}

/**
 * @deprecated Renamed to {@link AmeriaClient}; this alias will be removed
 * in a future version.
 */
export const Client = AmeriaClient;
/** @deprecated Renamed to {@link AmeriaClient}. */
export type Client = AmeriaClient;

/** Parameters of {@link AmeriaClient.initPayment}. */
export interface InitPaymentParams {
  /** Your order ID. In the test environment it must be in the range the bank gave you. */
  orderId: number | string;
  /** Amount in the payment currency. The test environment only accepts 10 AMD. */
  amount: number;
  /** Defaults to AMD. Alphabetic codes are converted to ISO numeric codes. */
  currency?: Currency;
  /** Shown to the payer on the payment page. */
  description: string;
  /** Where the bank sends the payer after the payment page. */
  backUrl: string;
  /** Free text returned to you with the payment. */
  opaque?: string;
  /** Set to save the card for later {@link AmeriaClient.makeBindingPayment} charges. */
  cardHolderId?: string;
  /** Payment page language. "hy" is sent as "am", the bank's code for Armenian. */
  lang?: "en" | "am" | "hy" | "ru";
  /** Seconds the payment page stays valid. */
  timeout?: number;
  /** Passed to the bank as-is; the bank does not document its values. */
  paymentServiceType?: number;
}

/** What you expect a payment to be, for {@link AmeriaClient.verifyPayment}. */
export interface VerifyPaymentExpected {
  /** The order total you charged. */
  amount: number;
  /** Defaults to AMD. */
  currency?: Currency;
  /** Your order ID; checked when given. */
  orderId?: number | string;
  /** Accept a two-step payment that is approved but not yet confirmed. */
  twoStep?: boolean;
}

/** Result of {@link AmeriaClient.verifyPayment}. */
export interface PaymentVerification {
  /** `true` only when it is safe to fulfil the order. */
  paid: boolean;
  /** Why `paid` is `false`. */
  reason?:
    | "declined"
    | "amount_mismatch"
    | "currency_mismatch"
    | "order_mismatch"
    | "refunded"
    | "not_completed";
  /** The bank's full answer, for logging or support. */
  details: PaymentDetailsResponse;
}

/** Parameters of {@link AmeriaClient.getPendingTransactions}. */
export interface GetPendingTransactionsParams {
  startDate: Date;
  endDate: Date;
}

/** Parameters of {@link AmeriaClient.makeBindingPayment}. */
export interface MakeBindingPaymentParams {
  amount: number;
  backUrl: string;
  /** The `cardHolderId` you passed to {@link AmeriaClient.initPayment} when the card was saved. */
  cardHolderId: string;
  currency?: Currency;
  description: string;
  opaque?: string;
  orderId: number;
  /** Defaults to "BindingMainRest". */
  paymentType?: PaymentType;
}
