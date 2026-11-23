export type ExamType = "CLASS_TEST" | "HALF_YEARLY" | "ANNUAL" | "MODEL_TEST" | "FINAL";
export type ExamStatus = "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";

export interface ExamRecord {
  id: number;
  schoolId: number;
  classId: number;
  sectionId: number | null;
  name: string;
  type: ExamType;
  academicYear: string;
  startDate: string;
  endDate: string;
  status: ExamStatus;
  class?: { id: number; name: string; code: string };
  section?: { id: number; name: string; code: string } | null;
  _count?: { results: number };
}

export interface CreateExamInput {
  classId: number;
  sectionId?: number;
  name: string;
  type: ExamType;
  academicYear: string;
  startDate: string;
  endDate: string;
  status?: ExamStatus;
}
