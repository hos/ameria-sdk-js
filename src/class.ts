import {
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
} from "./types";
import { AmeriaClientParams, AmeriaClient } from "./client";
import PaymentTypes from "./payment-types";

function paymentTypeCode(name: keyof typeof PaymentTypes): TPaymentEnum {
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

export class Client extends AmeriaClient {
  constructor(params: AmeriaClientParams) {
    super(params);
  }

  getUrl(paymentID: string, lang?: IInitPaymentParams["lang"]) {
    const url = new URL(`${this.host}/Payments/Pay`);
    url.searchParams.set("id", paymentID);
    if (lang) url.searchParams.set("lang", lang);
    return url.toString();
  }

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
      Currency: params.currency,
      Opaque: params.opaque,
    };

    const data: IInitPaymentResponse = await this.ameriaFetch(
      "InitPayment",
      body,
    );

    const { PaymentID, ResponseCode } = data;

    const url = ResponseCode === 1 ? this.getUrl(PaymentID, params.lang) : null;

    return { ...data, url };
  }

  async getPaymentId(orderId: string | number): Promise<IGetPaymentIdResponse> {
    const body: IGetPaymentIdBody = {
      OrderID: orderId,
    };

    return this.ameriaFetch("GetPaymentId", body);
  }

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

  async getPaymentDetails(paymentId: string): Promise<IPaymentDetailsResponse> {
    const body: IPaymentDetailsBody = {
      PaymentID: paymentId,
    };

    return this.ameriaFetch("GetPaymentDetails", body);
  }

  async getPendingTransactions(
    params: IGetPendingTransactionsParams,
  ): Promise<TGetPendingTransactionsResponse> {
    const body: IGetPendingTransactionsBody = {
      StartDate: params.startDate.toISOString(),
      EndDate: params.endDate.toISOString(),
    };

    return this.ameriaFetch("GetPendingTransactions", body);
  }

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

  async cancelPayment(paymentId: string): Promise<ICancelPaymentResponse> {
    const body: ICancelPaymentBody = {
      PaymentID: paymentId,
    };

    return this.ameriaFetch("CancelPayment", body);
  }

  async getBindings(
    paymentType: keyof typeof PaymentTypes,
  ): Promise<IGetCardBindingsResponse> {
    const num = paymentTypeCode(paymentType);

    const body: IGetBindingsBody = {
      PaymentType: num,
    };

    return this.ameriaFetch("GetBindings", body);
  }

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
      Currency: params.currency,
      Opaque: params.opaque,
    };

    return this.ameriaFetch("MakeBindingPayment", body);
  }
}

export interface IInitPaymentParams {
  amount: number;
  backURL: string;
  cardHolderId?: string;
  currency?: IInitPaymentBody["Currency"];
  description: string;
  lang?: "en" | "hy" | "ru";
  opaque: string;
  orderID: number | string;
}

export interface IGetPendingTransactionsParams {
  startDate: Date;
  endDate: Date;
}

export interface IMakeBindingPaymentParams {
  amount: number;
  backURL: string;
  cardHolderID: string;
  currency: IMakeBindingPaymentBody["Currency"];
  description: string;
  opaque: string;
  orderID: number;
  /** Defaults to "BindingMainRest". */
  paymentType?: keyof typeof PaymentTypes;
}
