import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { CreateSubjectInput, SubjectRecord } from "./types";

export const getSubjects = async (schoolId: number): Promise<SubjectRecord[]> => {
  const res = await api.get<ApiResponse<SubjectRecord[]>>(`/schools/${schoolId}/subjects`);
  return res.data.data;
};

export const createSubject = async (
  schoolId: number,
  payload: CreateSubjectInput,
): Promise<SubjectRecord> => {
  const res = await api.post<ApiResponse<SubjectRecord>>(
    `/schools/${schoolId}/subjects`,
    payload,
  );
  return res.data.data;
};

export const toggleSubjectStatus = async (schoolId: number, id: number) => {
  const res = await api.patch<ApiResponse<SubjectRecord>>(
    `/schools/${schoolId}/subjects/${id}/toggle-status`,
  );
  return res.data.data;
};

export const deleteSubject = async (schoolId: number, id: number) => {
  const res = await api.delete<ApiResponse<SubjectRecord>>(
    `/schools/${schoolId}/subjects/${id}`,
  );
  return res.data.data;
};
