"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import {
  createHefzEnrollment,
  getGuardianHefzProgress,
  getHefzDailyLogs,
  getHefzEnrollments,
  getStudentHefzProgress,
  upsertHefzDailyLog,
} from "./api";
import type { CreateHefzEnrollmentInput, UpsertHefzDailyLogInput } from "./types";

export const hefzKeys = {
  all: ["hefz"] as const,
  enrollments: (schoolId: number) => [...hefzKeys.all, "enrollments", schoolId] as const,
  logs: (schoolId: number, hefzEnrollmentId?: number) =>
    [...hefzKeys.all, "logs", schoolId, hefzEnrollmentId] as const,
  guardianProgress: (schoolId: number) => [...hefzKeys.all, "guardian", schoolId] as const,
  studentProgress: (schoolId: number, studentId: number) =>
    [...hefzKeys.all, "student", schoolId, studentId] as const,
};

export const useHefzEnrollments = (schoolId: number) =>
  useQuery({
    queryKey: hefzKeys.enrollments(schoolId),
    queryFn: () => getHefzEnrollments(schoolId),
    enabled: schoolId > 0,
  });

export const useCreateHefzEnrollment = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHefzEnrollmentInput) =>
      createHefzEnrollment(schoolId, payload),
    onSuccess: () => {
      toast.success("Student enrolled in Hefz/Najera");
      qc.invalidateQueries({ queryKey: hefzKeys.enrollments(schoolId) });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to enroll in Hefz")),
  });
};

export const useHefzDailyLogs = (schoolId: number, hefzEnrollmentId?: number) =>
  useQuery({
    queryKey: hefzKeys.logs(schoolId, hefzEnrollmentId),
    queryFn: () => getHefzDailyLogs(schoolId, hefzEnrollmentId ? { hefzEnrollmentId } : undefined),
    enabled: schoolId > 0,
  });

export const useUpsertHefzDailyLog = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertHefzDailyLogInput) =>
      upsertHefzDailyLog(schoolId, payload),
    onSuccess: () => {
      toast.success("Daily Sobok/Manzil log saved");
      qc.invalidateQueries({ queryKey: hefzKeys.all });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to save daily log")),
  });
};

export const useGuardianHefzProgress = (schoolId: number) =>
  useQuery({
    queryKey: hefzKeys.guardianProgress(schoolId),
    queryFn: () => getGuardianHefzProgress(schoolId),
    enabled: schoolId > 0,
  });

export const useStudentHefzProgress = (schoolId: number, studentId: number) =>
  useQuery({
    queryKey: hefzKeys.studentProgress(schoolId, studentId),
    queryFn: () => getStudentHefzProgress(schoolId, studentId),
    enabled: schoolId > 0 && studentId > 0,
  });
