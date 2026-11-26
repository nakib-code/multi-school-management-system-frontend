"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { notificationKeys } from "@/features/notifications/hooks";
import { getApiErrorMessage } from "@/lib/api";
import {
  type AttendanceListParams,
  bulkMarkAttendance,
  cancelLeaveRequest,
  createHoliday,
  createLeaveRequest,
  deleteAttendance,
  deleteHoliday,
  getAttendanceHistory,
  getAttendanceSettings,
  getAttendances,
  getAttendancesPaginated,
  getDayAttendance,
  getHolidays,
  getLeaveRequests,
  getMonthlyReport,
  getMyLinkedStudents,
  getPublishedReports,
  getStudentCalendar,
  publishMonthlyReport,
  reviewLeaveRequest,
  updateAttendance,
  updateAttendanceSettings,
} from "./api";
import type {
  BulkAttendanceInput,
  LeaveRequestStatus,
  UpdateAttendanceInput,
} from "./types";

export const attendanceKeys = {
  all: ["attendances"] as const,
  list: (schoolId: number, params?: Record<string, unknown>) =>
    [...attendanceKeys.all, "list", schoolId, params] as const,
  paginated: (schoolId: number, params?: Record<string, unknown>) =>
    [...attendanceKeys.all, "paginated", schoolId, params] as const,
  day: (schoolId: number, params: Record<string, unknown>) =>
    [...attendanceKeys.all, "day", schoolId, params] as const,
  history: (schoolId: number, id: number) =>
    [...attendanceKeys.all, "history", schoolId, id] as const,
  calendar: (schoolId: number, params: Record<string, unknown>) =>
    [...attendanceKeys.all, "calendar", schoolId, params] as const,
  myStudents: (schoolId: number) =>
    [...attendanceKeys.all, "my-students", schoolId] as const,
  report: (schoolId: number, params: Record<string, unknown>) =>
    [...attendanceKeys.all, "report", schoolId, params] as const,
  publishedReports: (schoolId: number, studentId?: number) =>
    [...attendanceKeys.all, "published-reports", schoolId, studentId] as const,
  settings: (schoolId: number) =>
    [...attendanceKeys.all, "settings", schoolId] as const,
  holidays: (schoolId: number, params?: Record<string, unknown>) =>
    [...attendanceKeys.all, "holidays", schoolId, params] as const,
  leaves: (schoolId: number, params?: Record<string, unknown>) =>
    [...attendanceKeys.all, "leaves", schoolId, params] as const,
};

export const useAttendances = (
  schoolId: number,
  params?: AttendanceListParams,
) =>
  useQuery({
    queryKey: attendanceKeys.list(
      schoolId,
      params as Record<string, unknown> | undefined,
    ),
    queryFn: () => getAttendances(schoolId, params),
    enabled: schoolId > 0,
  });

export const useAttendancesPaginated = (
  schoolId: number,
  params?: AttendanceListParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: attendanceKeys.paginated(
      schoolId,
      params as Record<string, unknown> | undefined,
    ),
    queryFn: () => getAttendancesPaginated(schoolId, params),
    enabled: (options?.enabled ?? true) && schoolId > 0,
  });

export const useDayAttendance = (
  schoolId: number,
  params: { date: string; classId?: number; sectionId?: number },
  enabled = true,
) =>
  useQuery({
    queryKey: attendanceKeys.day(schoolId, params),
    queryFn: () => getDayAttendance(schoolId, params),
    enabled: enabled && schoolId > 0 && Boolean(params.date),
  });

export const useAttendanceHistory = (
  schoolId: number,
  attendanceId: number | null,
) =>
  useQuery({
    queryKey: attendanceKeys.history(schoolId, attendanceId ?? 0),
    queryFn: () => getAttendanceHistory(schoolId, attendanceId ?? 0),
    enabled: schoolId > 0 && attendanceId !== null && attendanceId > 0,
  });

export const useMyLinkedStudents = (schoolId: number, enabled = true) =>
  useQuery({
    queryKey: attendanceKeys.myStudents(schoolId),
    queryFn: () => getMyLinkedStudents(schoolId),
    enabled: enabled && schoolId > 0,
    refetchOnWindowFocus: true,
  });

export const useStudentCalendar = (
  schoolId: number,
  params: { studentId?: number; month: string },
  options?: { enabled?: boolean; autoRefresh?: boolean },
) =>
  useQuery({
    queryKey: attendanceKeys.calendar(schoolId, params),
    queryFn: () => getStudentCalendar(schoolId, params),
    enabled:
      (options?.enabled ?? true) && schoolId > 0 && Boolean(params.month),
    refetchInterval: options?.autoRefresh ? 30_000 : false,
    refetchOnWindowFocus: true,
  });

export const useBulkMarkAttendance = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkAttendanceInput) =>
      bulkMarkAttendance(schoolId, payload),
    onSuccess: (res) => {
      if (res.changedCount === 0) {
        toast.info("No changes to save — attendance is already up to date");
      } else if (res.notifiedCount > 0) {
        toast.success(
          `Saved ${res.changedCount} change(s) — ${res.notifiedCount} guardian(s) notified`,
        );
      } else {
        toast.success(
          `Saved ${res.changedCount} record(s) — no absent/late alerts needed`,
        );
      }
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to save attendance")),
  });
};

export const useUpdateAttendance = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateAttendanceInput;
    }) => updateAttendance(schoolId, id, payload),
    onSuccess: (res) => {
      if (!res.changed) {
        toast.info("No changes detected");
      } else if (res.notifiedCount > 0) {
        toast.success(
          `Attendance updated — ${res.notifiedCount} guardian(s) notified`,
        );
      } else {
        toast.success("Attendance record updated");
      }
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to update attendance")),
  });
};

export const useDeleteAttendance = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAttendance(schoolId, id),
    onSuccess: () => {
      toast.success("Attendance record deleted");
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to delete attendance")),
  });
};

export const useMonthlyReport = (
  schoolId: number,
  params: { month: string; classId: number; sectionId?: number },
  enabled = true,
) =>
  useQuery({
    queryKey: attendanceKeys.report(schoolId, params),
    queryFn: () => getMonthlyReport(schoolId, params),
    enabled:
      enabled && schoolId > 0 && Boolean(params.month) && params.classId > 0,
  });

export const usePublishMonthlyReport = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      month: string;
      classId: number;
      sectionId?: number;
    }) => publishMonthlyReport(schoolId, payload),
    onSuccess: (res) => {
      toast.success(
        `Report published — ${res.notifiedGuardians} guardian(s) notified`,
      );
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to publish report")),
  });
};

export const usePublishedReports = (
  schoolId: number,
  studentId?: number,
  enabled = true,
) =>
  useQuery({
    queryKey: attendanceKeys.publishedReports(schoolId, studentId),
    queryFn: () => getPublishedReports(schoolId, studentId),
    enabled: enabled && schoolId > 0,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

export const useAttendanceSettings = (schoolId: number, enabled = true) =>
  useQuery({
    queryKey: attendanceKeys.settings(schoolId),
    queryFn: () => getAttendanceSettings(schoolId),
    enabled: enabled && schoolId > 0,
  });

export const useUpdateAttendanceSettings = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (weeklyOffDays: number[]) =>
      updateAttendanceSettings(schoolId, weeklyOffDays),
    onSuccess: () => {
      toast.success("Weekly-off days saved");
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to update settings")),
  });
};

export const useHolidays = (
  schoolId: number,
  params?: { month?: string; year?: number },
  enabled = true,
) =>
  useQuery({
    queryKey: attendanceKeys.holidays(schoolId, params),
    queryFn: () => getHolidays(schoolId, params),
    enabled: enabled && schoolId > 0,
  });

export const useCreateHoliday = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { date: string; title: string }) =>
      createHoliday(schoolId, payload),
    onSuccess: () => {
      toast.success("School holiday added");
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to add holiday")),
  });
};

export const useDeleteHoliday = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteHoliday(schoolId, id),
    onSuccess: () => {
      toast.success("Holiday removed");
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to remove holiday")),
  });
};

export const useLeaveRequests = (
  schoolId: number,
  params?: {
    status?: LeaveRequestStatus;
    studentId?: number;
    classId?: number;
    sectionId?: number;
  },
  options?: { enabled?: boolean; autoRefresh?: boolean },
) =>
  useQuery({
    queryKey: attendanceKeys.leaves(schoolId, params),
    queryFn: () => getLeaveRequests(schoolId, params),
    enabled: (options?.enabled ?? true) && schoolId > 0,
    refetchInterval: options?.autoRefresh ? 30_000 : false,
    refetchOnWindowFocus: true,
  });

export const useCreateLeaveRequest = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      studentId: number;
      fromDate: string;
      toDate: string;
      reason: string;
    }) => createLeaveRequest(schoolId, payload),
    onSuccess: () => {
      toast.success("Leave request submitted");
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to submit leave request")),
  });
};

export const useCancelLeaveRequest = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelLeaveRequest(schoolId, id),
    onSuccess: () => {
      toast.success("Leave request cancelled");
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to cancel leave request")),
  });
};

export const useReviewLeaveRequest = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      reviewNote,
    }: {
      id: number;
      status: "APPROVED" | "REJECTED";
      reviewNote?: string;
    }) => reviewLeaveRequest(schoolId, id, { status, reviewNote }),
    onSuccess: (_data, vars) => {
      toast.success(
        vars.status === "APPROVED"
          ? "Leave request approved & guardian notified"
          : "Leave request rejected & guardian notified",
      );
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
      qc.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to review leave request")),
  });
};
