"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import {
  activateStudent,
  createStudent,
  deactivateStudent,
  getMyStudentProfile,
  getStudentById,
  getStudents,
  updateStudent,
} from "./api";
import type { CreateStudentInput, UpdateStudentInput } from "./types";

export const studentKeys = {
  all: ["students"] as const,
  list: (
    schoolId: number,
    params?: { page?: number; limit?: number; search?: string },
  ) => [...studentKeys.all, schoolId, params] as const,
  detail: (schoolId: number, id: number) =>
    [...studentKeys.all, schoolId, "detail", id] as const,
  me: (schoolId: number) => [...studentKeys.all, schoolId, "me"] as const,
};

export const useCreateStudent = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStudentInput) =>
      createStudent(schoolId, payload),
    onSuccess: () => {
      toast.success("Student admitted successfully");
      qc.invalidateQueries({ queryKey: studentKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to admit student")),
  });
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

export const useStudentById = (schoolId: number, id: number) =>
  useQuery({
    queryKey: studentKeys.detail(schoolId, id),
    queryFn: () => getStudentById(schoolId, id),
    enabled: schoolId > 0 && id > 0,
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
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateStudentInput;
    }) => updateStudent(schoolId, id, payload),
    onSuccess: (_data, variables) => {
      toast.success("Student profile saved");
      qc.invalidateQueries({ queryKey: studentKeys.all });
      qc.invalidateQueries({
        queryKey: studentKeys.detail(schoolId, variables.id),
      });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to update student")),
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
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to deactivate student")),
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
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to activate student")),
  });
};

export interface ResetStudentPasswordResponse {
  studentId: number;
  studentCode: string;
  name: string;
  email: string;
  phone: string | null;
  temporaryPassword: string;
}

export const useResetStudentPassword = (schoolId: number) =>
  useMutation({
    mutationFn: async ({
      studentId,
      newPassword,
    }: {
      studentId: number;
      newPassword?: string;
    }) => {
      const { api } = await import("@/lib/api");
      const res = await api.post<{ data: ResetStudentPasswordResponse }>(
        `/schools/${schoolId}/students/${studentId}/reset-password`,
        newPassword ? { newPassword } : {},
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Student password reset successfully");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to reset student password")),
  });
