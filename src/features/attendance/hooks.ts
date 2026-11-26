"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import { bulkMarkAttendance, deleteAttendance, getAttendances } from "./api";
import type { BulkAttendanceInput } from "./types";

export const attendanceKeys = {
  all: ["attendances"] as const,
  list: (schoolId: number, params?: Record<string, unknown>) =>
    [...attendanceKeys.all, schoolId, params] as const,
};

export const useAttendances = (
  schoolId: number,
  params?: {
    studentId?: number;
    enrollmentId?: number;
    classId?: number;
    sectionId?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
  },
) =>
  useQuery({
    queryKey: attendanceKeys.list(schoolId, params),
    queryFn: () => getAttendances(schoolId, params),
    enabled: schoolId > 0,
  });

export const useBulkMarkAttendance = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkAttendanceInput) => bulkMarkAttendance(schoolId, payload),
    onSuccess: (saved) => {
      toast.success(
        `Attendance saved for ${saved.length} student(s) & instant guardian alerts dispatched`,
      );
      qc.invalidateQueries({ queryKey: attendanceKeys.all });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to save attendance")),
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
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to delete attendance")),
  });
};
