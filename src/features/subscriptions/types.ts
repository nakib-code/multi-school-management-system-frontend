export interface SubscriptionFeature {
  id: number;
  name: string;
  key: string;
  description?: string | null;
  value?: string | number | boolean | null;
}

export interface SubscriptionPackage {
  id: number;
  name: string;
  price: number | string;
  billingCycle: "MONTHLY" | "YEARLY";
  isActive: boolean;
  features: SubscriptionFeature[];
}

export type SubscriptionStatus =
  | "PENDING"
  | "ACTIVE"
  | "CANCELLED"
  | "EXPIRED";

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