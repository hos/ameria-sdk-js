import { TPaymentEnum } from "./types";

export type PaymentType =
  | "None"
  | "Arca"
  | "MasterCard"
  | "Visa"
  | "Reward"
  | "MainRest"
  | "BindingMainRest"
  | "PayPal"
  | "PayX";

const PaymentTypes: Record<PaymentType, TPaymentEnum> = {
  None: 0,
  Arca: 1,
  MasterCard: 2,
  Visa: 3,
  Reward: 4,
  MainRest: 5,
  BindingMainRest: 6,
  PayPal: 7,
  PayX: 11,
};

export default PaymentTypes;
