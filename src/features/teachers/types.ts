export interface TeacherRecord {
  id: number;
  userId?: number;
  schoolId?: number;
  employeeId: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  designation: string | null;
  qualification: string | null;
  joiningDate?: string;
  isActive: boolean;
  email?: string;
  status?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    status: string;
  };
}

export interface CreateTeacherInput {
  name: string;
  email: string;
  password: string;
  employeeId: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  address?: string;
  designation?: string;
  qualification?: string;
}

export interface TeacherAssignmentRecord {
  id: number;
  schoolId: number;
  teacherId: number;
  classId: number;
  sectionId: number;
  subjectId: number;
  academicYear: string;
  isActive: boolean;
  teacher?: { id: number; firstName: string; lastName: string | null; employeeId: string };
  class?: { id: number; name: string; code: string };
  section?: { id: number; name: string; code: string };
  subject?: { id: number; name: string; code: string };
}

export interface CreateTeacherAssignmentInput {
  teacherId: number;
  classId: number;
  sectionId: number;
  subjectId: number;
  academicYear: string;
}
