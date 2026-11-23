import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { AttendanceRecord, BulkAttendanceInput } from "./types";

export const getAttendances = async (
  schoolId: number,
  params?: { studentId?: number; enrollmentId?: number; status?: string; fromDate?: string; toDate?: string },
): Promise<AttendanceRecord[]> => {
  const res = await api.get<ApiResponse<AttendanceRecord[]>>(
    `/schools/${schoolId}/attendances`,
    { params },
  );
  return res.data.data;
};

export const bulkMarkAttendance = async (
  schoolId: number,
  payload: BulkAttendanceInput,
): Promise<AttendanceRecord[]> => {
  const res = await api.post<ApiResponse<AttendanceRecord[]>>(
    `/schools/${schoolId}/attendances/bulk`,
    payload,
  );
  return res.data.data;
};

export const deleteAttendance = async (schoolId: number, id: number) => {
  const res = await api.delete<ApiResponse<AttendanceRecord>>(
    `/schools/${schoolId}/attendances/${id}`,
  );
  return res.data.data;
};
