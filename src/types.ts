import type { RESPONSE_CODES } from "./response-codes.js";

export type AmeriaEndpoint =
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
export type CurrencyCode = "051" | "978" | "840" | "643";
/** Alphabetic codes accepted by this SDK and converted to numeric codes. */
export type CurrencyAlpha = "AMD" | "EUR" | "USD" | "RUB";
export type Currency = CurrencyCode | CurrencyAlpha;

export interface PaymentDetailsResponse {
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
  PaymentType: PaymentTypeCode;
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

export interface InitPaymentResponse {
  PaymentID: string;
  ResponseCode: 1 | 2;
  ResponseMessage: string;
}

export interface GetPaymentIdResponse {
  PaymentId: string;
  ResponseMessage: string;
  ResponseCode: string;
}

export type GetPendingTransactionsResponse = {
  OrderId: number;
  ClientName: string;
  CardNumber: string;
  Amount: number;
  PaymentDate: string;
  ErrorMessage: string;
}[];

export interface ConfirmPaymentResponse {
  ResponseCode: string;
  ResponseMessage: string;
  Opaque: string;
}

export interface RefundPaymentResponse {
  ResponseCode: string;
  ResponseMessage: string;
  Opaque: string;
}

export interface CancelPaymentResponse {
  ResponseCode: string;
  ResponseMessage: string;
  Opaque: string;
}

export type PaymentTypeCode =
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

export interface GetBindingsResponse {
  ResponseCode: string;
  ResponseMessage: string;
  CardBindingFileds: {
    CardHolderID: string;
    CardPan: string;
    ExpDate: string;
    IsAvtive: boolean;
  }[];
}

export interface ActivateBindingResponse {
  ResponseCode: string;
  ResponseMessage: string;
  CardHolderID: string;
}

export interface DeactivateBindingResponse {
  ResponseCode: string;
  ResponseMessage: string;
  CardHolderID: string;
}

export interface MakeBindingPaymentResponse {
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
  PaymentType: PaymentTypeCode;
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

export type SsnIdentifierType =
  | 1 // SSN
  | 2 // CertificateOfAbsenceOfSSN
  | 3 // ARMPassport
  | 4 // IdCard
  | 5; // InternationalPassport

export interface SsnCheckResponse {
  Status: string;
  Message: string;
}
