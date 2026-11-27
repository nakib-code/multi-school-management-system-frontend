"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import {
  createSalaryPayment,
  createTeacherSalary,
  getTeacherSalaries,
} from "./api";
import type {
  CreateSalaryPaymentInput,
  CreateTeacherSalaryInput,
} from "./types";

export const salaryKeys = {
  all: ["teacher-salaries"] as const,
  list: (schoolId: number, params?: Record<string, unknown>) =>
    [...salaryKeys.all, schoolId, params] as const,
};

export const useTeacherSalaries = (
  schoolId: number,
  params?: {
    teacherId?: number;
    month?: number;
    year?: number;
    status?: string;
  },
) =>
  useQuery({
    queryKey: salaryKeys.list(schoolId, params),
    queryFn: () => getTeacherSalaries(schoolId, params),
    enabled: schoolId > 0,
  });

export const useCreateTeacherSalary = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTeacherSalaryInput) =>
      createTeacherSalary(schoolId, payload),
    onSuccess: () => {
      toast.success("Teacher salary sheet created");
      qc.invalidateQueries({ queryKey: salaryKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to create salary")),
  });
};

export const useCreateSalaryPayment = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSalaryPaymentInput) =>
      createSalaryPayment(schoolId, payload),
    onSuccess: () => {
      toast.success("Salary payment recorded");
      qc.invalidateQueries({ queryKey: salaryKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to record salary payment")),
  });
};

export const useUpdateTeacherSalary = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: {
        basicSalary?: number;
        allowance?: number;
        deduction?: number;
        remarks?: string;
      };
    }) => {
      const { api } = await import("@/lib/api");
      const res = await api.patch(
        `/schools/${schoolId}/teacher-salaries/${id}`,
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Salary record updated");
      qc.invalidateQueries({ queryKey: salaryKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to update salary record")),
  });
};
