import fetch from "node-fetch";

import {
  AmeriaFns,
  IInitPaymentResponse,
  InitPaymentBody,
  IPaymentDetailsRequest,
  TGetPaymentDetails,
  TInitPayment,
} from "./types";

interface Params {
  clientId: string;
  username: string;
  password: string;
  isTest?: boolean;
}

const HOST = "https://services.ameriabank.am/VPOS";
const TEST_HOST = "https://servicestest.ameriabank.am/VPOS";

export class AmeriaClient {
  #clientId: string;
  #username: string;
  #password: string;
  #host: string;

  constructor(params: Params) {
    this.#clientId = params.clientId;
    this.#username = params.username;
    this.#password = params.password;
    this.#host = params.isTest ? TEST_HOST : HOST;
  }

  ameriaFetch = async (path: AmeriaFns, body: any): Promise<any> => {
    const response = await fetch(`${this.#host}/api/VPOS/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        ClientID: this.#clientId,
        Username: this.#username,
        Password: this.#password,
      }),
    });

    const contentType = response.headers.get("content-type");
    if (contentType?.startsWith("application/json")) {
      return await response.json();
    } else {
      return await response.text();
    }
  };

  getPaymentDetails: TGetPaymentDetails = async (paymentId) => {
    const body: IPaymentDetailsRequest = {
      PaymentID: paymentId,
    };

    const data = await this.ameriaFetch("GetPaymentDetails", body);

    return data;
  };

  initPayment: TInitPayment = async (params) => {
    const {
      orderId,
      amount,
      desc,
      opaque,
      lang = "en",
      userId,
      backUrl,
    } = params;
    const body: InitPaymentBody = {
      OrderID: orderId,
      Amount: amount,
      Description: desc,
      BackURL: backUrl,
      CardHolderID: userId,
      Opaque: opaque,
    };

    const data: IInitPaymentResponse = await this.ameriaFetch(
      "InitPayment",
      body
    );

    const { PaymentID, ResponseCode } = data;

    const url =
      ResponseCode === 1
        ? `${this.#host}/Payments/Pay?id=${PaymentID}&amp;lang=${lang}`
        : null;

    return { ...data, url };
  };
}
