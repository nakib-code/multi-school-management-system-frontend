import { BillingCycle } from "../packages/type";

export type SubscriptionStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "CANCELLED"
  | "PENDING";

export interface SubscriptionPackage {
  id: number;
  name: string;
  description: string | null;
  price: number | string;
  billingCycle: BillingCycle;
  studentLimit: number;
  isCustom: boolean;
  isActive: boolean;
}

export interface SubscriptionSchool {
  id: number;
  name: string;
  code: string;
  status: string;
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