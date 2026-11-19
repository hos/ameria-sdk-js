import type { RESPONSE_CODES } from "./response-codes.js";

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
  | "MakeBindingPayment"
  | "SSNCheck";

/** ISO 4217 numeric codes, the format the bank documents and echoes back. */
export type TCurrencyCode = "051" | "978" | "840" | "643";
/** Alphabetic codes accepted by this SDK and converted to numeric codes. */
export type TCurrencyAlpha = "AMD" | "EUR" | "USD" | "RUB";
export type TCurrency = TCurrencyCode | TCurrencyAlpha;

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
  OrderID: string;
  PaymentState: string;
  PaymentType: TPaymentEnum;
  ResponseCode: keyof typeof RESPONSE_CODES;
  rrn: string;
  TerminalId: string;
  TrxnDescription: string;
  OrderStatus: string;
  RefundedAmount: number;
  CardHolderID: string;
  MDOrderID: string;
  PrimaryRC: string;
  ExpDate: string;
  ProcessingIP: string;
  BindingID: string;
  ActionCode: string;
  ExchangeRate: number;
  BankInfo?: {
    BankName: string;
    BankCountryCode: string;
    BankCountryName: string;
  } | null;
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
  Currency?: TCurrencyCode;
  Description: string;
  OrderID: number | string;
  Amount: number;
  BackURL?: string;
  Opaque?: string;
  CardHolderID?: number | string;
  /** Seconds the payment page stays valid. */
  Timeout?: number;
  PaymentServiceType?: number;
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
  OrderId: number;
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

export interface IRefundPaymentResponse {
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
  | 11 //PayX
  | 12 //MirCard
  | 13 //ApplePay
  | 14 //EPGCardApplePay
  | 17; //Amex

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
  OrderID: number;
  BackURL: string;
  PaymentType: TPaymentEnum;
  Description: string;
  Currency?: TCurrencyCode;
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
  /** Set when the issuer asks for 3-D Secure; redirect the payer to AcsUrl. */
  AcsUrl?: string | null;
  PaReq?: string | null;
  TermUrl?: string | null;
}

export type TSSNIdentifierType =
  | 1 // SSN
  | 2 // CertificateOfAbsenceOfSSN
  | 3 // ARMPassport
  | 4 // IdCard
  | 5; // InternationalPassport

export interface ISSNCheckBody {
  PaymentID: string;
  SSN: string;
  IdentifierType: TSSNIdentifierType;
}

export interface ISSNCheckResponse {
  Status: string;
  Message: string;
}
