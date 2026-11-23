"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getApiErrorMessage } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

export type DayOfWeek =
  | "SATURDAY"
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY";

export interface ClassRoutineRecord {
  id: number;
  schoolId: number;
  classId: number;
  sectionId: number | null;
  subjectId: number;
  teacherId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  roomNumber: string | null;
  academicYear: string;
  isActive: boolean;
  class?: { id: number; name: string; code: string };
  section?: { id: number; name: string; code: string } | null;
  subject?: { id: number; name: string; code: string };
  teacher?: { id: number; firstName: string; lastName: string | null; employeeId: string };
}

export interface CreateRoutineInput {
  classId: number;
  sectionId?: number | null;
  subjectId: number;
  teacherId: number;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  roomNumber?: string | null;
  academicYear: string;
}

export const routineKeys = {
  all: ["class-routines"] as const,
  list: (schoolId: number, params?: Record<string, unknown>) =>
    [...routineKeys.all, schoolId, params] as const,
};

export const useClassRoutines = (
  schoolId: number,
  params?: { classId?: number; dayOfWeek?: DayOfWeek; academicYear?: string },
) =>
  useQuery({
    queryKey: routineKeys.list(schoolId, params),
    queryFn: async () => {
      const res = await api.get<ApiResponse<ClassRoutineRecord[]>>(
        `/schools/${schoolId}/routines`,
        { params },
      );
      return res.data.data;
    },
    enabled: schoolId > 0,
  });

export const useCreateClassRoutine = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRoutineInput) => {
      const res = await api.post<ApiResponse<ClassRoutineRecord>>(
        `/schools/${schoolId}/routines`,
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Class routine added");
      qc.invalidateQueries({ queryKey: routineKeys.all });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to create routine")),
  });
};

export const useDeleteClassRoutine = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/schools/${schoolId}/routines/${id}`);
    },
    onSuccess: () => {
      toast.success("Routine slot removed");
      qc.invalidateQueries({ queryKey: routineKeys.all });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to delete routine")),
  });
};
