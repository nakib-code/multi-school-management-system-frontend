export type SchoolStatus =
  | "PENDING"
  | "ACTIVE"
  | "BLOCKED"
  | "REJECTED";

export interface School {
  id: number;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo: string | null;

  status: SchoolStatus;

  adminName: string | null;
  adminEmail: string | null;
  adminPhone: string | null;

  adminEmailVerified: boolean;
  rejectionReason: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface SchoolListResponse {
  schools: School[];

  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}