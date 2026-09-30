export type BillingCycle = "MONTHLY" | "YEARLY" | "CUSTOM";

export type PackageFeature =
  | "SCHOOL_MANAGEMENT"
  | "USER_MANAGEMENT"
  | "STUDENT_MANAGEMENT"
  | "TEACHER_MANAGEMENT"
  | "GUARDIAN_MANAGEMENT"
  | "ADMISSION"
  | "ATTENDANCE"
  | "CLASS_MANAGEMENT"
  | "SUBJECT_MANAGEMENT"
  | "EXAM_MANAGEMENT"
  | "RESULT_MANAGEMENT"
  | "FEES_MANAGEMENT"
  | "PAYMENT_MANAGEMENT"
  | "TEACHER_SALARY"
  | "REPORTS"
  | "NOTIFICATIONS";

export interface PackageFeatureConfig {
  id: number;
  packageId: number;
  feature: PackageFeature;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Package {
  id: number;
  name: string;
  description: string | null;
  price: number | string;
  billingCycle: BillingCycle;
  studentLimit: number;
  isCustom: boolean;
  isActive: boolean;
  features: PackageFeatureConfig[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackagePayload {
  name: string;
  description?: string;
  price: number;
  billingCycle: BillingCycle;
  studentLimit: number;
  isCustom?: boolean;
  isActive?: boolean;
  features: {
    feature: PackageFeature;
    enabled: boolean;
  }[];
}

export interface UpdatePackagePayload {
  name?: string;
  description?: string;
  price?: number;
  billingCycle?: BillingCycle;
  studentLimit?: number;
  isActive?: boolean;
  features?: {
    feature: PackageFeature;
    enabled: boolean;
  }[];
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