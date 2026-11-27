import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { CreateEnrollmentInput, EnrollmentRecord } from "./types";

export const getEnrollments = async (
  schoolId: number,
  params?: {
    classId?: number;
    sectionId?: number;
    academicYear?: string;
    status?: string;
  },
): Promise<EnrollmentRecord[]> => {
  const res = await api.get<ApiResponse<EnrollmentRecord[]>>(
    `/schools/${schoolId}/enrollments`,
    { params },
  );
  return res.data.data;
};

export const createEnrollment = async (
  schoolId: number,
  payload: CreateEnrollmentInput,
): Promise<EnrollmentRecord> => {
  const res = await api.post<ApiResponse<EnrollmentRecord>>(
    `/schools/${schoolId}/enrollments`,
    payload,
  );
  return res.data.data;
};

export const deleteEnrollment = async (schoolId: number, id: number) => {
  const res = await api.delete<ApiResponse<EnrollmentRecord>>(
    `/schools/${schoolId}/enrollments/${id}`,
  );
  return res.data.data;
};
