import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  CreateTeacherAssignmentInput,
  CreateTeacherInput,
  ResendTeacherOtpResponse,
  ResetTeacherPasswordInput,
  TeacherAssignmentRecord,
  TeacherRecord,
} from "./types";

export const getTeachers = async (
  schoolId: number,
  search?: string,
): Promise<TeacherRecord[]> => {
  const res = await api.get<ApiResponse<TeacherRecord[]>>(
    `/schools/${schoolId}/teachers`,
    { params: search ? { search } : undefined },
  );
  return res.data.data;
};

export const createTeacher = async (
  schoolId: number,
  payload: CreateTeacherInput,
): Promise<TeacherRecord> => {
  const res = await api.post<ApiResponse<TeacherRecord>>(
    `/schools/${schoolId}/teachers`,
    payload,
  );
  return res.data.data;
};

export const verifyTeacherEmail = async (
  schoolId: number,
  teacherId: number,
  code: string,
) => {
  const res = await api.patch<ApiResponse<unknown>>(
    `/schools/${schoolId}/teachers/${teacherId}/verify-email`,
    { code },
  );
  return res.data.data;
};

export const resendTeacherOtp = async (
  schoolId: number,
  teacherId: number,
): Promise<ResendTeacherOtpResponse> => {
  const res = await api.post<ApiResponse<ResendTeacherOtpResponse>>(
    `/schools/${schoolId}/teachers/${teacherId}/resend-otp`,
  );
  return res.data.data;
};

export const resetTeacherPassword = async (
  schoolId: number,
  teacherId: number,
  payload: ResetTeacherPasswordInput,
) => {
  const res = await api.post<ApiResponse<unknown>>(
    `/schools/${schoolId}/teachers/${teacherId}/reset-password`,
    payload,
  );
  return res.data.data;
};

export const deactivateTeacher = async (schoolId: number, teacherId: number) => {
  const res = await api.delete<ApiResponse<TeacherRecord>>(
    `/schools/${schoolId}/teachers/${teacherId}`,
  );
  return res.data.data;
};

export const getTeacherAssignments = async (
  schoolId: number,
  params?: { teacherId?: number; classId?: number; academicYear?: string },
): Promise<TeacherAssignmentRecord[]> => {
  const res = await api.get<ApiResponse<TeacherAssignmentRecord[]>>(
    `/schools/${schoolId}/teacher-assignments`,
    { params },
  );
  return res.data.data;
};

export const createTeacherAssignment = async (
  schoolId: number,
  payload: CreateTeacherAssignmentInput,
): Promise<TeacherAssignmentRecord> => {
  const res = await api.post<ApiResponse<TeacherAssignmentRecord>>(
    `/schools/${schoolId}/teacher-assignments`,
    payload,
  );
  return res.data.data;
};

export const deleteTeacherAssignment = async (schoolId: number, id: number) => {
  const res = await api.delete<ApiResponse<TeacherAssignmentRecord>>(
    `/schools/${schoolId}/teacher-assignments/${id}`,
  );
  return res.data.data;
};
