export type SchoolStatus =
  | "PENDING"
  | "ACTIVE"
  | "BLOCKED"
  | "REJECTED";

export interface CreateSchoolInput {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  adminName: string;
  adminEmail: string;
  adminPhone?: string;
  adminPassword: string;
  packageId: number;
}

export interface RegisteredSchool {
  id: number;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo: string | null;
  status: SchoolStatus;
}

export interface RegisteredAdmin {
  name: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
}

export interface CreateSchoolResponse {
  school: RegisteredSchool;
  admin: RegisteredAdmin;
  message: string;
}

export interface VerifyAdminEmailPayload {
  email: string;
  code: string;
}

export interface VerifyAdminEmailResponse {
  schoolId: number;
  adminEmail: string | null;
  emailVerified: boolean;
}

/* ---------------- School Management ---------------- */

export interface SchoolListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SchoolStatus;
}

export interface SchoolListResponse {
  schools: RegisteredSchool[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RejectSchoolPayload {
  reason: string;
}

