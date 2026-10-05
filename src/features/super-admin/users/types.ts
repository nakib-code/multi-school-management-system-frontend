export type SchoolUserRole =
  | "ADMIN"
  | "MANAGER"
  | "TEACHER"
  | "STUDENT"
  | "GUARDIAN";

export type SchoolUserStatus = "ACTIVE" | "INACTIVE";

export interface SchoolUserSummary {
  school: {
    id: number;
    name: string;
    code: string;
    status: string;
  };

  counts: {
    total: number;
    admin: number;
    manager: number;
    teacher: number;
    student: number;
    guardian: number;
  };
}

export interface SchoolUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: SchoolUserRole;
  status: SchoolUserStatus;
  schoolId: number | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface SchoolUsersMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SchoolUsersResponse {
  users: SchoolUser[];
  meta: SchoolUsersMeta;
}

export interface GetSchoolUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: SchoolUserRole;
  status?: SchoolUserStatus;
}