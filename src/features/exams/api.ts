import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { CreateExamInput, ExamRecord, ExamStatus } from "./types";

export const getExams = async (
  schoolId: number,
  params?: { classId?: number; status?: string; academicYear?: string },
): Promise<ExamRecord[]> => {
  const res = await api.get<ApiResponse<ExamRecord[]>>(`/schools/${schoolId}/exams`, {
    params,
  });
  return res.data.data;
};

export const createExam = async (
  schoolId: number,
  payload: CreateExamInput,
): Promise<ExamRecord> => {
  const res = await api.post<ApiResponse<ExamRecord>>(
    `/schools/${schoolId}/exams`,
    payload,
  );
  return res.data.data;
};

export const updateExamStatus = async (
  schoolId: number,
  id: number,
  status: ExamStatus,
) => {
  const res = await api.patch<ApiResponse<ExamRecord>>(
    `/schools/${schoolId}/exams/${id}`,
    { status },
  );
  return res.data.data;
};

export const deleteExam = async (schoolId: number, id: number) => {
  const res = await api.delete<ApiResponse<ExamRecord>>(
    `/schools/${schoolId}/exams/${id}`,
  );
  return res.data.data;
};
