import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  CreateStudentInput,
  CreateStudentResponse,
  StudentListResponse,
  StudentRecord,
  UpdateStudentInput,
} from "./types";

export const createStudent = async (
  schoolId: number,
  payload: CreateStudentInput,
): Promise<CreateStudentResponse> => {
  const res = await api.post<ApiResponse<CreateStudentResponse>>(
    `/schools/${schoolId}/students`,
    payload,
  );
  return res.data.data;
};

export const getStudents = async (
  schoolId: number,
  params?: { page?: number; limit?: number; search?: string },
): Promise<StudentListResponse> => {
  const res = await api.get<ApiResponse<StudentListResponse>>(
    `/schools/${schoolId}/students`,
    { params },
  );
  return res.data.data;
};

export const getStudentById = async (
  schoolId: number,
  id: number,
): Promise<StudentRecord> => {
  const res = await api.get<ApiResponse<StudentRecord>>(
    `/schools/${schoolId}/students/${id}`,
  );
  return res.data.data;
};

export const getMyStudentProfile = async (
  schoolId: number,
): Promise<StudentRecord> => {
  const res = await api.get<ApiResponse<StudentRecord>>(
    `/schools/${schoolId}/students/me`,
  );
  return res.data.data;
};

export const updateStudent = async (
  schoolId: number,
  id: number,
  payload: UpdateStudentInput,
): Promise<StudentRecord> => {
  const res = await api.patch<ApiResponse<StudentRecord>>(
    `/schools/${schoolId}/students/${id}`,
    payload,
  );
  return res.data.data;
};

export const deactivateStudent = async (
  schoolId: number,
  id: number,
): Promise<StudentRecord> => {
  const res = await api.delete<ApiResponse<StudentRecord>>(
    `/schools/${schoolId}/students/${id}`,
  );
  return res.data.data;
};

export const activateStudent = async (
  schoolId: number,
  id: number,
): Promise<StudentRecord> => {
  const res = await api.patch<ApiResponse<StudentRecord>>(
    `/schools/${schoolId}/students/${id}/activate`,
  );
  return res.data.data;
};
