import { BillingCycle, PackageFeature } from "../packages/type";


export type CustomPackageRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export interface CustomPackageRequestFeature {
  id: number;
  requestId: number;
  feature: PackageFeature;
  enabled: boolean;
  createdAt: string;
}

export interface CustomPackageRequestSchool {
  id: number;
  name: string;
  code: string;
  status: string;
}

export interface CustomPackageRequest {
  id: number;

  schoolId: number;

  requestedStudentLimit: number;
  requestedPrice: number | string;

  billingCycle: BillingCycle;

  description: string | null;

  status: CustomPackageRequestStatus;

  reviewedBy: number | null;
  reviewedAt: string | null;
  reviewNote: string | null;

  school: CustomPackageRequestSchool;

  features: CustomPackageRequestFeature[];

  createdAt: string;
  updatedAt: string;
}

export interface CustomPackageRequestListResponse {
  success: boolean;
  message: string;
  data: CustomPackageRequest[];
}

export interface CustomPackageRequestResponse {
  success: boolean;
  message: string;
  data: CustomPackageRequest;
}

export interface ReviewCustomPackageRequestPayload {
  status: "APPROVED" | "REJECTED";
  reviewNote?: string;
}