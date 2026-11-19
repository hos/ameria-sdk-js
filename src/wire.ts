/** Request bodies as the bank expects them. Internal: not exported from the package. */
import type {
  CurrencyCode,
  PaymentTypeCode,
  SsnIdentifierType,
} from "./types.js";

export interface PaymentDetailsBody {
  PaymentID: string;
}

export interface InitPaymentBody {
  Currency?: CurrencyCode;
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

export interface GetPaymentIdBody {
  OrderID: number | string;
}
export interface GetPendingTransactionsBody {
  StartDate: string;
  EndDate: string;
}

export interface ConfirmPaymentBody {
  PaymentID: string;
  Amount: number;
}

export interface RefundPaymentBody {
  PaymentID: string;
  Amount: number;
}

export interface CancelPaymentBody {
  PaymentID: string;
}

export interface GetBindingsBody {
  PaymentType: PaymentTypeCode;
}

export interface ActivateBindingBody {
  CardHolderID: string;
  PaymentType: number;
}

export interface DeactivateBindingBody {
  CardHolderID: string;
  PaymentType: number;
}

export interface MakeBindingPaymentBody {
  CardHolderID: string;
  Amount: number;
  OrderID: number;
  BackURL: string;
  PaymentType: PaymentTypeCode;
  Description: string;
  Currency?: CurrencyCode;
  Opaque?: string;
}

export interface SsnCheckBody {
  PaymentID: string;
  SSN: string;
  IdentifierType: SsnIdentifierType;
}
