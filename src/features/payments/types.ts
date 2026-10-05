export interface InitiateSubscriptionPaymentResponse {
  paymentId: number;
  subscriptionId: number;
  transactionId: string;
  amount: number;
  currency: string;
  paymentUrl: string;
}

export interface CashPaymentRequestResponse {
  paymentId: number;
  subscriptionId: number;
  status: string;
  paymentMethod: string;
}

export interface PendingCashPayment {
  id: number;
  subscriptionId: number;
  schoolId: number;

  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;

  transactionId?: string | null;
  createdAt: string;

  school: {
    id: number;
    name: string;
    code: string;
    adminName: string;
    adminEmail: string;
    adminPhone: string | null;
  };

  subscription: {
    id: number;
    status: string;

    package: {
      id: number;
      name: string;
      price: number;
      billingCycle: "MONTHLY" | "YEARLY" | "CUSTOM";
    };
  };
}

export type PendingCashPaymentsResponse = PendingCashPayment[];

export interface CashPaymentActionResponse {
  paymentId: number;
  subscriptionId: number;
  schoolId: number;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  paidAt?: string | null;
  remarks?: string | null;
}
