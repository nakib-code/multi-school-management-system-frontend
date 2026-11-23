"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import {
  activateStudent,
  deactivateStudent,
  getMyStudentProfile,
  getStudents,
  updateStudent,
} from "./api";
import type { UpdateStudentInput } from "./types";

export const studentKeys = {
  all: ["students"] as const,
  list: (schoolId: number, params?: { page?: number; limit?: number; search?: string }) =>
    [...studentKeys.all, schoolId, params] as const,
  me: (schoolId: number) => [...studentKeys.all, schoolId, "me"] as const,
};

export const useStudents = (
  schoolId: number,
  params?: { page?: number; limit?: number; search?: string },
) =>
  useQuery({
    queryKey: studentKeys.list(schoolId, params),
    queryFn: () => getStudents(schoolId, params),
    enabled: schoolId > 0,
  });

export const useMyStudentProfile = (schoolId: number) =>
  useQuery({
    queryKey: studentKeys.me(schoolId),
    queryFn: () => getMyStudentProfile(schoolId),
    enabled: schoolId > 0,
  });

export const useUpdateStudent = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateStudentInput }) =>
      updateStudent(schoolId, id, payload),
    onSuccess: () => {
      toast.success("Student updated successfully");
      qc.invalidateQueries({ queryKey: studentKeys.all });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to update student")),
  });
};

export const useDeactivateStudent = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deactivateStudent(schoolId, id),
    onSuccess: () => {
      toast.success("Student deactivated");
      qc.invalidateQueries({ queryKey: studentKeys.all });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to deactivate student")),
  });
};

export const useActivateStudent = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => activateStudent(schoolId, id),
    onSuccess: () => {
      toast.success("Student activated");
      qc.invalidateQueries({ queryKey: studentKeys.all });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to activate student")),
  });
};
