export interface ClassDiaryRecord {
  id: number;
  schoolId: number;
  classId: number;
  sectionId: number | null;
  subjectId: number | null;
  teacherId: number | null;
  createdById: number;
  diaryDate: string;
  title: string | null;
  classwork: string;
  homework: string | null;
  dueDate: string | null;
  attachmentUrl: string | null;
  createdAt: string;
  updatedAt: string;
  notifiedCount?: number;
  class: { id: number; name: string; code: string };
  section: { id: number; name: string; code: string } | null;
  subject: { id: number; name: string; code: string } | null;
  teacher: {
    id: number;
    firstName: string;
    lastName: string | null;
    employeeId: string;
  } | null;
  createdBy: { id: number; name: string; role: string };
}

export interface CreateClassDiaryInput {
  classId: number;
  sectionId?: number | null;
  subjectId?: number | null;
  diaryDate: string;
  title?: string | null;
  classwork: string;
  homework?: string | null;
  dueDate?: string | null;
  attachmentUrl?: string | null;
}

export type UpdateClassDiaryInput = Partial<CreateClassDiaryInput>;

export interface ClassDiaryFilterParams {
  classId?: number;
  sectionId?: number;
  subjectId?: number;
  date?: string;
  fromDate?: string;
  toDate?: string;
}
