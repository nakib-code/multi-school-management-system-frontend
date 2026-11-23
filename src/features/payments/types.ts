export type MobilePaymentMethod = "BKASH" | "NAGAD" | "ROCKET";
export type SubscriptionPaymentStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface PaymentMethodsResponse {
  supportedMethods: MobilePaymentMethod[];
  receiverNumbers: Record<MobilePaymentMethod, string | null>;
}

export interface SubmitSubscriptionPaymentInput {
  paymentMethod: MobilePaymentMethod;
  senderNumber: string;
  receiverNumber?: string;
  trxId: string;
  paidAmount: number;
  paidAt?: string;
  remarks?: string;
}

export interface SubscriptionPaymentRecord {
  id: number;
  subscriptionId: number;
  schoolId: number;
  paymentMethod: MobilePaymentMethod;
  senderNumber: string;
  receiverNumber: string | null;
  trxId: string;
  paidAmount: number;
  currency: string;
  status: SubscriptionPaymentStatus;
  paidAt: string;
  verifiedById?: number | null;
  verifiedAt?: string | null;
  rejectionReason?: string | null;
  remarks?: string | null;
  createdAt: string;
  school?: {
    id: number;
    name: string;
    code: string;
    adminName?: string | null;
    adminEmail?: string | null;
    adminPhone?: string | null;
  };
  subscription?: {
    id: number;
    status: string;
    price?: number | string;
    startDate?: string;
    endDate?: string;
    package?: {
      id: number;
      name: string;
      price: number | string;
      billingCycle: "MONTHLY" | "YEARLY" | "CUSTOM";
    };
  };
  verifiedBy?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface SubscriptionPaymentSummary {
  totalRevenue: number;
  bkashRevenue: number;
  nagadRevenue: number;
  rocketRevenue: number;
  pendingAmount: number;
  totalPayments: number;
  verifiedPayments: number;
  pendingPayments: number;
  rejectedPayments: number;
}
