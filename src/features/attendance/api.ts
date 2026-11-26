import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  AttendanceHistoryItem,
  AttendanceRecord,
  AttendanceSettings,
  BulkAttendanceInput,
  BulkAttendanceResult,
  DayAttendanceResponse,
  LeaveRequestItem,
  LeaveRequestStatus,
  LinkedStudent,
  MonthlyReportResponse,
  PaginatedAttendanceResponse,
  PaginationMeta,
  PublishedGuardianReport,
  SchoolHoliday,
  StudentCalendarResponse,
  UpdateAttendanceInput,
  UpdateAttendanceResult,
} from "./types";

export interface AttendanceListParams {
  studentId?: number;
  enrollmentId?: number;
  classId?: number;
  sectionId?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const getAttendances = async (
  schoolId: number,
  params?: AttendanceListParams,
): Promise<AttendanceRecord[]> => {
  const res = await api.get<ApiResponse<AttendanceRecord[]>>(
    `/schools/${schoolId}/attendances`,
    { params },
  );
  return res.data.data;
};

export const getAttendancesPaginated = async (
  schoolId: number,
  params?: AttendanceListParams,
): Promise<PaginatedAttendanceResponse> => {
  const res = await api.get<
    ApiResponse<AttendanceRecord[]> & { meta?: PaginationMeta }
  >(`/schools/${schoolId}/attendances`, { params });
  const records = res.data.data ?? [];
  const meta: PaginationMeta = res.data.meta ?? {
    page: params?.page ?? 1,
    pageSize: params?.pageSize ?? 50,
    total: records.length,
    totalPages: 1,
  };
  return { records, meta };
};

export const getDayAttendance = async (
  schoolId: number,
  params: { date: string; classId?: number; sectionId?: number },
): Promise<DayAttendanceResponse> => {
  const res = await api.get<ApiResponse<DayAttendanceResponse>>(
    `/schools/${schoolId}/attendances/day`,
    { params },
  );
  return res.data.data;
};

export const bulkMarkAttendance = async (
  schoolId: number,
  payload: BulkAttendanceInput,
): Promise<BulkAttendanceResult> => {
  const res = await api.post<
    ApiResponse<AttendanceRecord[]> & {
      meta?: { changedCount?: number; notifiedCount?: number };
    }
  >(`/schools/${schoolId}/attendances/bulk`, payload);
  return {
    records: res.data.data ?? [],
    changedCount: res.data.meta?.changedCount ?? 0,
    notifiedCount: res.data.meta?.notifiedCount ?? 0,
  };
};

export const updateAttendance = async (
  schoolId: number,
  id: number,
  payload: UpdateAttendanceInput,
): Promise<UpdateAttendanceResult> => {
  const res = await api.patch<
    ApiResponse<AttendanceRecord> & {
      meta?: { changed?: boolean; notifiedCount?: number };
    }
  >(`/schools/${schoolId}/attendances/${id}`, payload);
  return {
    record: res.data.data,
    changed: res.data.meta?.changed ?? true,
    notifiedCount: res.data.meta?.notifiedCount ?? 0,
  };
};

export const deleteAttendance = async (schoolId: number, id: number) => {
  const res = await api.delete<ApiResponse<AttendanceRecord>>(
    `/schools/${schoolId}/attendances/${id}`,
  );
  return res.data.data;
};

export const getAttendanceHistory = async (
  schoolId: number,
  id: number,
): Promise<AttendanceHistoryItem[]> => {
  const res = await api.get<ApiResponse<AttendanceHistoryItem[]>>(
    `/schools/${schoolId}/attendances/${id}/history`,
  );
  return res.data.data;
};

export const getMyLinkedStudents = async (
  schoolId: number,
): Promise<LinkedStudent[]> => {
  const res = await api.get<ApiResponse<LinkedStudent[]>>(
    `/schools/${schoolId}/attendances/my-students`,
  );
  return res.data.data;
};

export const getStudentCalendar = async (
  schoolId: number,
  params: { studentId?: number; month: string },
): Promise<StudentCalendarResponse> => {
  const res = await api.get<ApiResponse<StudentCalendarResponse>>(
    `/schools/${schoolId}/attendances/calendar`,
    { params },
  );
  return res.data.data;
};

export const getMonthlyReport = async (
  schoolId: number,
  params: { month: string; classId: number; sectionId?: number },
): Promise<MonthlyReportResponse> => {
  const res = await api.get<ApiResponse<MonthlyReportResponse>>(
    `/schools/${schoolId}/attendance-reports`,
    { params },
  );
  return res.data.data;
};

export const publishMonthlyReport = async (
  schoolId: number,
  payload: { month: string; classId: number; sectionId?: number },
): Promise<{ notifiedGuardians: number }> => {
  const res = await api.post<ApiResponse<{ notifiedGuardians: number }>>(
    `/schools/${schoolId}/attendance-reports/publish`,
    payload,
  );
  return res.data.data;
};

export const getPublishedReports = async (
  schoolId: number,
  studentId?: number,
): Promise<PublishedGuardianReport[]> => {
  const res = await api.get<ApiResponse<PublishedGuardianReport[]>>(
    `/schools/${schoolId}/attendance-reports/published`,
    { params: studentId ? { studentId } : undefined },
  );
  return res.data.data;
};

export const getAttendanceSettings = async (
  schoolId: number,
): Promise<AttendanceSettings> => {
  const res = await api.get<ApiResponse<AttendanceSettings>>(
    `/schools/${schoolId}/attendance-settings`,
  );
  return res.data.data;
};

export const updateAttendanceSettings = async (
  schoolId: number,
  weeklyOffDays: number[],
): Promise<AttendanceSettings> => {
  const res = await api.patch<ApiResponse<AttendanceSettings>>(
    `/schools/${schoolId}/attendance-settings`,
    { weeklyOffDays },
  );
  return res.data.data;
};

export const getHolidays = async (
  schoolId: number,
  params?: { month?: string; year?: number },
): Promise<SchoolHoliday[]> => {
  const res = await api.get<ApiResponse<SchoolHoliday[]>>(
    `/schools/${schoolId}/holidays`,
    { params },
  );
  return res.data.data;
};

export const createHoliday = async (
  schoolId: number,
  payload: { date: string; title: string },
): Promise<SchoolHoliday> => {
  const res = await api.post<ApiResponse<SchoolHoliday>>(
    `/schools/${schoolId}/holidays`,
    payload,
  );
  return res.data.data;
};

export const deleteHoliday = async (schoolId: number, id: number) => {
  const res = await api.delete<ApiResponse<SchoolHoliday>>(
    `/schools/${schoolId}/holidays/${id}`,
  );
  return res.data.data;
};

export const getLeaveRequests = async (
  schoolId: number,
  params?: {
    status?: LeaveRequestStatus;
    studentId?: number;
    classId?: number;
    sectionId?: number;
  },
): Promise<LeaveRequestItem[]> => {
  const res = await api.get<ApiResponse<LeaveRequestItem[]>>(
    `/schools/${schoolId}/leave-requests`,
    { params },
  );
  return res.data.data;
};

export const createLeaveRequest = async (
  schoolId: number,
  payload: {
    studentId: number;
    fromDate: string;
    toDate: string;
    reason: string;
  },
): Promise<LeaveRequestItem> => {
  const res = await api.post<ApiResponse<LeaveRequestItem>>(
    `/schools/${schoolId}/leave-requests`,
    payload,
  );
  return res.data.data;
};

export const cancelLeaveRequest = async (schoolId: number, id: number) => {
  const res = await api.patch<ApiResponse<LeaveRequestItem>>(
    `/schools/${schoolId}/leave-requests/${id}/cancel`,
  );
  return res.data.data;
};

export const reviewLeaveRequest = async (
  schoolId: number,
  id: number,
  payload: { status: "APPROVED" | "REJECTED"; reviewNote?: string },
): Promise<LeaveRequestItem> => {
  const res = await api.patch<ApiResponse<LeaveRequestItem>>(
    `/schools/${schoolId}/leave-requests/${id}/review`,
    payload,
  );
  return res.data.data;
};
