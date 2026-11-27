export interface SubscriptionPackage {
  id: number;
  name: string;
  price: number | string;
  billingCycle: "MONTHLY" | "YEARLY";
  studentLimit?: number;
  isActive: boolean;
}

export type SubscriptionStatus = "PENDING" | "ACTIVE" | "CANCELLED" | "EXPIRED";

export interface MySubscriptionPayment {
  id: number;
  subscriptionId: number;
  paymentMethod: "BKASH" | "NAGAD" | "ROCKET";
  senderNumber: string;
  receiverNumber?: string | null;
  trxId: string;
  paidAmount: number;
  currency: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  paidAt: string;
  verifiedAt?: string | null;
  rejectionReason?: string | null;
  remarks?: string | null;
  createdAt: string;
  package?: {
    id: number;
    name: string;
    price: number;
    billingCycle: "MONTHLY" | "YEARLY";
  };
}

export interface MySubscription {
  id: number;
  schoolId: number;
  packageId: number;
  startDate: string;
  endDate: string;
  price: number | string;
  status: SubscriptionStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  package: SubscriptionPackage;
  activeStudentsCount?: number;
  pendingUpgrade?: Omit<
    MySubscription,
    "activeStudentsCount" | "pendingUpgrade" | "payments"
  > | null;
  payments?: MySubscriptionPayment[];
}

export interface MySubscriptionPaymentsResponse {
  success: boolean;
  message: string;
  data: MySubscriptionPayment[];
}

export interface MySubscriptionResponse {
  success: boolean;
  message: string;
  data: MySubscription | null;
}

export interface SelectPackageResponse {
  success: boolean;
  message: string;
  data: MySubscription;
}
