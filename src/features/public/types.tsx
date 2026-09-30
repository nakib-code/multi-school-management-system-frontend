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

export interface PublicPackageFeature {
  feature: PackageFeature;
  enabled: boolean;
}

export interface PublicPackage {
  id: number;
  name: string;
  description: string | null;
  price: string | number;
  billingCycle: BillingCycle;
  studentLimit: number;
  isCustom: boolean;
  features: PublicPackageFeature[];
}