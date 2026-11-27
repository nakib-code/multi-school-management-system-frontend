export type EnrollmentStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "TRANSFERRED"
  | "DROPPED";

export interface EnrollmentRecord {
  id: number;
  schoolId: number;
  studentId: number;
  classId: number;
  sectionId: number | null;
  academicYear: string;
  rollNumber: number | null;
  status: EnrollmentStatus;
  enrolledAt: string;
  student?: {
    id: number;
    firstName: string;
    lastName: string | null;
    studentId: string;
  };
  class?: { id: number; name: string; code: string };
  section?: { id: number; name: string; code: string } | null;
}

export interface CreateEnrollmentInput {
  studentId: number;
  classId: number;
  sectionId?: number;
  academicYear: string;
  rollNumber?: number;
  status?: EnrollmentStatus;
}
