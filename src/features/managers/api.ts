import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { CreateManagerInput, ManagerRecord } from "./types";

export const getManagers = async (schoolId: number): Promise<ManagerRecord[]> => {
  const res = await api.get<ApiResponse<ManagerRecord[]>>(`/schools/${schoolId}/managers`);
  return res.data.data;
};

export const createManager = async (
  schoolId: number,
  payload: CreateManagerInput,
): Promise<ManagerRecord> => {
  const res = await api.post<ApiResponse<ManagerRecord>>(
    `/schools/${schoolId}/managers`,
    payload,
  );
  return res.data.data;
};

export const deleteManager = async (schoolId: number, id: number) => {
  const res = await api.delete<ApiResponse<ManagerRecord>>(
    `/schools/${schoolId}/managers/${id}`,
  );
  return res.data.data;
};
