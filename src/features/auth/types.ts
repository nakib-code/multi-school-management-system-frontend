export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "TEACHER"
  | "STUDENT"
  | "GUARDIAN";

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  schoolId: number | null;
  mustChangePassword: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}