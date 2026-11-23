export interface GuardianRecord {
  id: number;
  userId: number;
  schoolId: number;
  relation: string | null;
  occupation: string | null;
  address: string | null;
  user?: { id: number; name: string; email: string; phone?: string | null; status: string };
  students?: Array<{
    studentId: number;
    isPrimary: boolean;
    student?: { id: number; firstName: string; lastName: string | null; studentId: string };
  }>;
}

export interface CreateGuardianInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  relation?: string;
  occupation?: string;
  address?: string;
  studentIds?: number[];
}
