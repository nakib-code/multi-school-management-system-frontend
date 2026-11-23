import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { CreateGuardianInput, GuardianRecord } from "./types";

export const getGuardians = async (schoolId: number): Promise<GuardianRecord[]> => {
  const res = await api.get<ApiResponse<GuardianRecord[]>>(`/schools/${schoolId}/guardians`);
  return res.data.data;
};

export const createGuardian = async (
  schoolId: number,
  payload: CreateGuardianInput,
): Promise<GuardianRecord> => {
  const res = await api.post<ApiResponse<GuardianRecord>>(
    `/schools/${schoolId}/guardians`,
    payload,
  );
  return res.data.data;
};

export const linkStudentToGuardian = async (
  schoolId: number,
  guardianId: number,
  studentId: number,
) => {
  const res = await api.post<ApiResponse<unknown>>(
    `/schools/${schoolId}/guardians/${guardianId}/students`,
    { studentId },
  );
  return res.data.data;
};

export const unlinkStudentFromGuardian = async (
  schoolId: number,
  guardianId: number,
  studentId: number,
) => {
  const res = await api.delete<ApiResponse<unknown>>(
    `/schools/${schoolId}/guardians/${guardianId}/students/${studentId}`,
  );
  return res.data.data;
};

export const deleteGuardian = async (schoolId: number, id: number) => {
  const res = await api.delete<ApiResponse<GuardianRecord>>(
    `/schools/${schoolId}/guardians/${id}`,
  );
  return res.data.data;
};
