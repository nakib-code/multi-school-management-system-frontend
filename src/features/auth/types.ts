export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "TEACHER"
  | "STUDENT"
  | "GUARDIAN";

export type UserStatus = "ACTIVE" | "INACTIVE";

export type MobileAccountType = "PERSONAL" | "MERCHANT" | "AGENT";

export interface UserSchoolSetting {
  hasGeneralSection: boolean;
  hasHefzSection: boolean;
  hasOnlineAdmission: boolean;
  hasTeacherPayroll: boolean;
  smsEnabled: boolean;
  bkashNumber: string | null;
  bkashType: MobileAccountType;
  nagadNumber: string | null;
  nagadType: MobileAccountType;
  rocketNumber: string | null;
  rocketType: MobileAccountType;
  feePaymentInstruction: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl?: string | null;
  role: UserRole;
  status: UserStatus;
  schoolId: number | null;
  mustChangePassword: boolean;
  schoolSetting?: UserSchoolSetting | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}
