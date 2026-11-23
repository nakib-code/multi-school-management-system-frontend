import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  CreateHefzEnrollmentInput,
  HefzDailyLogRecord,
  HefzEnrollmentRecord,
  UpsertHefzDailyLogInput,
} from "./types";

export const getHefzEnrollments = async (
  schoolId: number,
): Promise<HefzEnrollmentRecord[]> => {
  const res = await api.get<ApiResponse<HefzEnrollmentRecord[]>>(
    `/schools/${schoolId}/hefz/enrollments`,
  );
  return res.data.data;
};

export const createHefzEnrollment = async (
  schoolId: number,
  payload: CreateHefzEnrollmentInput,
): Promise<HefzEnrollmentRecord> => {
  const res = await api.post<ApiResponse<HefzEnrollmentRecord>>(
    `/schools/${schoolId}/hefz/enrollments`,
    payload,
  );
  return res.data.data;
};

export const getHefzDailyLogs = async (
  schoolId: number,
  params?: { hefzEnrollmentId?: number },
): Promise<HefzDailyLogRecord[]> => {
  const res = await api.get<ApiResponse<HefzDailyLogRecord[]>>(
    `/schools/${schoolId}/hefz/daily-logs`,
    { params },
  );
  return res.data.data;
};

export const upsertHefzDailyLog = async (
  schoolId: number,
  payload: UpsertHefzDailyLogInput,
): Promise<HefzDailyLogRecord> => {
  const res = await api.post<ApiResponse<HefzDailyLogRecord>>(
    `/schools/${schoolId}/hefz/daily-logs`,
    payload,
  );
  return res.data.data;
};

export const getGuardianHefzProgress = async (schoolId: number) => {
  const res = await api.get<ApiResponse<unknown>>(
    `/schools/${schoolId}/hefz/guardian/progress`,
  );
  return res.data.data;
};

export const getStudentHefzProgress = async (
  schoolId: number,
  studentId: number,
) => {
  const res = await api.get<ApiResponse<unknown>>(
    `/schools/${schoolId}/hefz/students/${studentId}/progress`,
  );
  return res.data.data;
};
