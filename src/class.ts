import {
  IGetPaymentIdBody,
  IInitPaymentResponse,
  IInitPaymentBody,
  IPaymentDetailsBody,
  IPaymentDetailsResponse,
  IGetPendingTransactionsBody,
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
import { ok } from "assert";
import { AmeriaClientParams, AmeriaClient } from "./client";
import PaymentTypes from "./payment-types";

export class Client extends AmeriaClient {
  constructor(params: AmeriaClientParams) {
    super(params);
  }

  getUrl(paymentID: string, lang?: string) {
    const langStr = lang ? `&amp;lang=${lang}` : "";
    return `${this.host}/Payments/Pay?id=${paymentID}${langStr}`;
  }

  async initPayment(
    params: IInitPaymentParams
  ): Promise<IInitPaymentResponse & { url: string | null }> {
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
      body
    );

    const { PaymentID, ResponseCode } = data;

    const url = ResponseCode === 1 ? this.getUrl(PaymentID, params.lang) : null;

    return { ...data, url };
  }

  async getPaymentId(orderId: string): Promise<IPaymentDetailsResponse> {
    const body: IGetPaymentIdBody = {
      OrderID: orderId,
    };

    const data = await this.ameriaFetch("GetPaymentId", body);

    return data;
  }

  async confirmPayment(
    paymentId: string,
    amount: number
  ): Promise<IConfirmPaymentResponse> {
    const body: IConfirmPaymentBody = {
      PaymentID: paymentId,
      Amount: amount,
    };

    const data = await this.ameriaFetch("ConfirmPayment", body);

    return data;
  }

  async getPaymentDetails(paymentId: string): Promise<IPaymentDetailsResponse> {
    const body: IPaymentDetailsBody = {
      PaymentID: paymentId,
    };

    const data = await this.ameriaFetch("GetPaymentDetails", body);

    return data;
  }

  async getPendingTransactions(params: IGetPendingTransactionsParams) {
    const body: IGetPendingTransactionsBody = {
      StartDate: params.startDate.toISOString(),
      EndDate: params.startDate.toISOString(),
    };

    const data = await this.ameriaFetch("GetPendingTransactions", body);

    return data;
  }

  async refundPayment(
    paymentId: string,
    amount: number
  ): Promise<IRefundPaymentResponse> {
    const body: IRefundPaymentBody = {
      PaymentID: paymentId,
      Amount: amount,
    };

    const data = await this.ameriaFetch("RefundPayment", body);

    return data;
  }

  async cancelPayment(paymentId: string): Promise<ICancelPaymentResponse> {
    const body: ICancelPaymentBody = {
      PaymentID: paymentId,
    };

    const data = await this.ameriaFetch("CancelPayment", body);

    return data;
  }

  async getBindings(paymentType: keyof typeof PaymentTypes) {
    const num: TPaymentEnum = PaymentTypes[paymentType];
    ok(num);

    const body: IGetBindingsBody = {
      PaymentType: num,
    };

    const data = await this.ameriaFetch("GetBindings", body);

    return data;
  }

  async activateBinding(
    cardHolderId: string,
    paymentType: keyof typeof PaymentTypes
  ) {
    const num = PaymentTypes[paymentType];
    ok(num);

    const body: IActivateBindingBody = {
      CardHolderID: cardHolderId,
      PaymentType: num,
    };

    const data = await this.ameriaFetch("ActivateBinding", body);

    return data;
  }

  async deactivateBinding(
    cardHolderId: string,
    paymentType: keyof typeof PaymentTypes
  ) {
    const num = PaymentTypes[paymentType];
    ok(num);

    const body: IDeactivateBindingBody = {
      CardHolderID: cardHolderId,
      PaymentType: num,
    };

    const data = await this.ameriaFetch("DeactivateBinding", body);

    return data;
  }

  async makeBindingPayment(params: IMakeBindingPaymentParams) {
    const num = PaymentTypes[params.paymentType || 'BindingMainRest'];
    ok(num);
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

    const data: IMakeBindingPaymentResponse = await this.ameriaFetch(
      "MakeBindingPayment",
      body
    );

    return data;
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
  paymentType: keyof typeof PaymentTypes;
}
