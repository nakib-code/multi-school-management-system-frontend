"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import { createEnrollment, deleteEnrollment, getEnrollments } from "./api";
import type { CreateEnrollmentInput } from "./types";

export const enrollmentKeys = {
  all: ["enrollments"] as const,
  list: (schoolId: number, params?: Record<string, unknown>) =>
    [...enrollmentKeys.all, schoolId, params] as const,
};

export const useEnrollments = (
  schoolId: number,
  params?: {
    classId?: number;
    sectionId?: number;
    academicYear?: string;
    status?: string;
  },
) =>
  useQuery({
    queryKey: enrollmentKeys.list(schoolId, params),
    queryFn: () => getEnrollments(schoolId, params),
    enabled: schoolId > 0,
  });

export const useCreateEnrollment = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEnrollmentInput) =>
      createEnrollment(schoolId, payload),
    onSuccess: () => {
      toast.success("Student enrolled successfully");
      qc.invalidateQueries({ queryKey: enrollmentKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to enroll student")),
  });
};

export const useDeleteEnrollment = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteEnrollment(schoolId, id),
    onSuccess: () => {
      toast.success("Enrollment removed");
      qc.invalidateQueries({ queryKey: enrollmentKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to delete enrollment")),
  });
};
