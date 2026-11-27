export interface ResultRecord {
  id: number;
  schoolId: number;
  studentId: number;
  examId: number;
  subjectId: number;
  enrollmentId: number;
  marks: number | string;
  grade: string;
  gradePoint: number | string;
  remarks: string | null;
  publishedAt: string | null;
  student?: {
    id: number;
    firstName: string;
    lastName: string | null;
    studentId: string;
  };
  exam?: { id: number; name: string; type: string; academicYear: string };
  subject?: {
    id: number;
    name: string;
    code: string;
    fullMarks: number;
    passMarks: number;
  };
}

export interface CreateResultInput {
  studentId: number;
  examId: number;
  subjectId: number;
  enrollmentId: number;
  marks: number;
  remarks?: string;
  publishedAt?: string;
}
