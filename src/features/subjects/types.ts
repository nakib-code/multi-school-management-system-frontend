export interface SubjectRecord {
  id: number;
  schoolId: number;
  name: string;
  code: string;
  description: string | null;
  fullMarks: number;
  passMarks: number;
  isActive: boolean;
}

export interface CreateSubjectInput {
  name: string;
  code: string;
  description?: string;
  fullMarks?: number;
  passMarks?: number;
}
