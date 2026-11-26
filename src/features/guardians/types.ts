export interface GuardianRecord {
  id: number;
  userId: number;
  schoolId: number;
  relation: string | null;
  occupation: string | null;
  address: string | null;
  nid?: string | null;
  temporaryPassword?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    status: string;
  };
  students?: Array<{
    studentId: number;
    isPrimary: boolean;
    student?: {
      id: number;
      firstName: string;
      lastName: string | null;
      studentId: string;
    };
  }>;
}

export interface CreateGuardianInput {
  name: string;
  phone: string;
  email?: string;
  password?: string;
  relation?: string;
  occupation?: string;
  address?: string;
  nid?: string;
  studentIds?: number[];
}

export interface ResetGuardianPasswordInput {
  password?: string;
  mustChangePassword?: boolean;
}

export interface ResetGuardianPasswordResponse {
  guardianId: number;
  name: string;
  phone: string | null;
  temporaryPassword: string;
  mustChangePassword: boolean;
}
