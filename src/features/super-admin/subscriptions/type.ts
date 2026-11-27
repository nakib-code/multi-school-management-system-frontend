import type { BillingCycle } from "../packages/type";

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING";

export interface SubscriptionPackage {
  id: number;
  name: string;
  description: string | null;
  price: number | string;
  billingCycle: BillingCycle;
  studentLimit: number;
  isActive: boolean;
}

export interface SubscriptionSchool {
  id: number;
  name: string;
  code: string;
  status: string;
}

export interface SubscriptionLinkedPayment {
  id: number;
  paymentMethod: "BKASH" | "NAGAD" | "ROCKET";
  senderNumber: string;
  receiverNumber: string | null;
  trxId: string;
  paidAmount: number;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  paidAt: string;
  verifiedAt: string | null;
  rejectionReason: string | null;
  remarks: string | null;
  createdAt: string;
  verifiedBy?: { id: number; name: string; role: string } | null;
}

export interface Subscription {
  id: number;

  schoolId: number;
  packageId: number;

  startDate: string;
  endDate: string;

  status: SubscriptionStatus;

  price: number | string;

  notes: string | null;

  school: SubscriptionSchool;
  package: SubscriptionPackage;
  payments?: SubscriptionLinkedPayment[];

  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionListResponse {
  success: boolean;
  message: string;
  data: Subscription[];
}

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  data: Subscription;
}
