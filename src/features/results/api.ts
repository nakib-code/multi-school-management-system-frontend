import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { CreateResultInput, ResultRecord } from "./types";

export const getResults = async (
  schoolId: number,
  params?: { studentId?: number; examId?: number; subjectId?: number },
): Promise<ResultRecord[]> => {
  const res = await api.get<ApiResponse<ResultRecord[]>>(`/schools/${schoolId}/results`, {
    params,
  });
  return res.data.data;
};

export const createResult = async (
  schoolId: number,
  payload: CreateResultInput,
): Promise<ResultRecord> => {
  const res = await api.post<ApiResponse<ResultRecord>>(
    `/schools/${schoolId}/results`,
    payload,
  );
  return res.data.data;
};

export const deleteResult = async (schoolId: number, id: number) => {
  const res = await api.delete<ApiResponse<ResultRecord>>(
    `/schools/${schoolId}/results/${id}`,
  );
  return res.data.data;
};
