import responseCodes from "./responseCodes";

export type AmeriaFns =
  | "InitPayment"
  | "GetPaymentId"
  | "GetPendingTransactions"
  | "ConfirmPayment"
  | "GetPaymentDetails"
  | "RefundPayment"
  | "CancelPayment"
  | "GetBindings"
  | "ActivateBinding"
  | "DeactivateBinding"
  | "MakeBindingPayment";

export interface IPaymentDetailsBody {
  PaymentID: string;
  Username?: string;
  Password?: string;
}

export interface IPaymentDetailsResponse {
  Amount: number;
  ApprovedAmount: number;
  ApprovalCode: string;
  CardNumber: string;
  ClientName: string;
  ClientEmail: string;
  Currency: string;
  DateTime: string;
  DepositedAmount: number;
  Description: string;
  MerchantId: string;
  Opaque: string;
  OrderID: number;
  PaymentState: string;
  PaymentType:
    | 5 // MainRest (arca)
    | 7 // PayPal
    | 6; // Binding
  ResponseCode: keyof typeof responseCodes;
  rrn: string;
  TerminalId: string;
  TrxnDescription: string;
  OrderStatus: number;
  RefundedAmount: string;
  CardHolderID: string;
  MDOrderID: string;
  PrimaryRC: string;
  ExpDate: string;
  ProcessingIP: string;
  BindingID: string;
  ActionCode: string;
  ExchangeRate: string;
}

export interface IInitPaymentResponse {
  PaymentID: string;
  ResponseCode: 1 | 2;
  ResponseMessage: string;
}

export interface IInitPaymentBody {
  ClientID?: string;
  Username?: string;
  Password?: string;
  Currency?: "AMD" | "EUR" | "USD" | "RUB";
  Description: string;
  OrderID: number | string;
  Amount: number;
  BackURL?: string;
  Opaque?: string;
  CardHolderID?: number | string;
}

export interface IGetPaymentIdBody {
  ClientID?: string;
  Username?: string;
  Password?: string;
  OrderID: number | string;
}
export interface IGetPaymentIdResponse {
  PaymentId: string;
  ResponseMessage: string;
  ResponseCode: string;
}

export interface IGetPendingTransactionsBody {
  ClientID?: string;
  Username?: string;
  Password?: string;
  StartDate: string;
  EndDate: string;
}

export type TGetPendingTransactionsResponse = {
  OrderId: string | number;
  ClientName: string;
  CardNumber: string;
  Amount: number;
  PaymentDate: string;
  ErrorMessage: string;
}[];

export interface IConfirmPaymentBody {
  PaymentID: string;
  Username?: string;
  Password?: string;
  Amount: number;
}

export interface IConfirmPaymentResponse {
  ResponseCode: string;
  ResponseMessage: string;
  Opaque: string;
}

export interface IRefundPaymentBody {
  Username?: string;
  Password?: string;
  PaymentID: string;
  Amount: number;
}

export interface IRefundPaymentResponses {
  ResponseCode: string;
  ResponseMessage: string;
  Opaque: string;
}

export interface ICancelPaymentBody {
  PaymentID: string;
  Username?: string;
  Password?: string;
}

export interface ICancelPaymentResponse {
  ResponseCode: string;
  ResponseMessage: string;
  Opaque: string;
}

export type TPaymentEnum =
  | 0 //None
  | 1 //Arca
  | 2 //MasterCard
  | 3 //Visa
  | 4 //Reward
  | 5 //MainRest
  | 6 //BindingMainRest
  | 7 //PayPal
  | 11; //PayX

export interface IGetBindingsBody {
  ClientID?: string;
  Username?: string;
  Password?: string;
  PaymentType: TPaymentEnum;
}

export interface IGetCardBindingsResponse {
  ResponseCode: string;
  ResponseMessage: string;
  CardBindingFileds: {
    CardHolderID: string;
    CardPan: string;
    ExpDate: string;
    IsAvtive: boolean;
  }[];
}

export interface IActivateBindingBody {
  ClientID?: string;
  Username?: string;
  Password?: string;
  CardHolderID: string;
  PaymentType: number;
}

export interface IActivateBindingResponse {
  ResponseCode: string;
  ResponseMessage: string;
  CardHolderID: string;
}

export interface IDeactivateBindingBody {
  ClientID?: string;
  Username?: string;
  Password?: string;
  CardHolderID: string;
  PaymentType: number;
}

export interface IDeactivateBindingResponse {
  ResponseCode: string;
  ResponseMessage: string;
  CardHolderID: string;
}

export interface IMakeBindingPaymentBody {
  ClientID?: string;
  Username?: string;
  Password?: string;
  CardHolderID: string;
  Amount: number;
  OrderID: number | string;
  BackURL: string;
  PaymentType: TPaymentEnum;
  Description: string;
  Currency: string;
  Opaque: string;
}

export interface IMakeBindingPaymentResponse {
  PaymentID: string;
  ResponseCode: string;
  Amount: number;
  ApprovedAmount: number;
  ApprovalCode: string;
  CardNumber: string;
  ClientName: string;
  Currency: string;
  DateTime: string;
  DepositedAmount: number;
  Description: string;
  MDOrderID: string;
  MerchantId: string;
  TerminalId: string;
  OrderID: string;
  PaymentState: string;
  PaymentType: TPaymentEnum;
  PrimaryRC: string;
  ExpDate: string;
  ProcessingIP: string;
  OrderStatus: string;
  CardHolderID: string;
  BindingID: string;
  RefundedAmount: number;
  Opaque: string;
  TrxnDescription: string;
  rrn: string;
  ActionCode: string;
}
