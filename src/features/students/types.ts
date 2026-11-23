export interface StudentRecord {
  id: number;
  userId: number;
  schoolId: number;
  studentId: string;
  firstName: string;
  lastName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
  admissionDate: string;
  isActive: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    status: string;
    role: string;
  };
}

export interface StudentListResponse {
  students: StudentRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateStudentInput {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  address?: string;
}
