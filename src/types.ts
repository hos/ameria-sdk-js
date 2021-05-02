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

export interface IPaymentDetailsRequest {
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

export type TGetPaymentDetails = (
  paymentId: string
) => Promise<IPaymentDetailsResponse>;

export type TInitPayment = (params: {
  orderId: number | string;
  amount: number;
  desc: string;
  opaque: string;
  backUrl: string;
  lang?: "en" | "hy" | "ru";
  userId?: string;
}) => Promise<IInitPaymentResponse & { url: string | null }>;

export interface IInitPaymentResponse {
  PaymentID: string;
  ResponseCode: 1 | 2;
  ResponseMessage: string;
}

export interface InitPaymentBody {
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
