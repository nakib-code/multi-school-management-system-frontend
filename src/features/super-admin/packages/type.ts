export type BillingCycle = "MONTHLY" | "YEARLY";

export interface Package {
  id: number;
  name: string;
  description: string | null;
  price: number | string;
  billingCycle: BillingCycle;
  studentLimit: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackagePayload {
  name: string;
  description?: string;
  price: number;
  billingCycle: BillingCycle;
  studentLimit: number;
  isActive?: boolean;
}

export interface UpdatePackagePayload {
  name?: string;
  description?: string;
  price?: number;
  billingCycle?: BillingCycle;
  studentLimit?: number;
  isActive?: boolean;
}

export interface PackageListResponse {
  success: boolean;
  message: string;
  data: Package[];
}

export interface PackageResponse {
  success: boolean;
  message: string;
  data: Package;
}
