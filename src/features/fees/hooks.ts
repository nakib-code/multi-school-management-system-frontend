"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dashboardKeys } from "@/features/dashboard/hooks";
import { reportKeys } from "@/features/reports/hooks";
import { getApiErrorMessage } from "@/lib/api";
import {
  bulkCreateStudentFees,
  createStudentFee,
  deleteStudentFee,
  getStudentFees,
  getStudentPayments,
  rejectStudentPayment,
  submitStudentPayment,
  verifyStudentPayment,
} from "./api";
import type {
  BulkCreateStudentFeeInput,
  CreateStudentFeeInput,
  FeeStatus,
  SubmitStudentPaymentInput,
} from "./types";

export const feeKeys = {
  all: ["student-fees"] as const,
  fees: (schoolId: number, params?: Record<string, unknown>) =>
    [...feeKeys.all, "list", schoolId, params] as const,
  payments: (schoolId: number, params?: Record<string, unknown>) =>
    [...feeKeys.all, "payments", schoolId, params] as const,
};

export const useStudentFees = (
  schoolId: number,
  params?: {
    studentId?: number;
    classId?: number;
    sectionId?: number;
    academicYear?: string;
    billingMonth?: string;
    examId?: number;
    status?: string;
    feeType?: string;
  },
) =>
  useQuery({
    queryKey: feeKeys.fees(schoolId, params),
    queryFn: () => getStudentFees(schoolId, params),
    enabled: schoolId > 0,
  });

export const useCreateStudentFee = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStudentFeeInput) =>
      createStudentFee(schoolId, payload),
    onSuccess: () => {
      toast.success("Student fee invoice created");
      qc.invalidateQueries({ queryKey: feeKeys.all });
      qc.invalidateQueries({ queryKey: reportKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to create fee")),
  });
};

export const useBulkCreateStudentFees = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkCreateStudentFeeInput) =>
      bulkCreateStudentFees(schoolId, payload),
    onSuccess: (data) => {
      toast.success(
        `Generated ${data.createdCount} invoice(s) for ${data.className}${data.skippedCount > 0 ? ` (${data.skippedCount} skipped)` : ""}`,
      );
      qc.invalidateQueries({ queryKey: feeKeys.all });
      qc.invalidateQueries({ queryKey: reportKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to generate class fees")),
  });
};

export const useDeleteStudentFee = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteStudentFee(schoolId, id),
    onSuccess: () => {
      toast.success("Fee invoice deleted");
      qc.invalidateQueries({ queryKey: feeKeys.all });
      qc.invalidateQueries({ queryKey: reportKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to delete fee")),
  });
};

export const useStudentPayments = (
  schoolId: number,
  params?: { studentId?: number; feeId?: number; status?: string },
) =>
  useQuery({
    queryKey: feeKeys.payments(schoolId, params),
    queryFn: () => getStudentPayments(schoolId, params),
    enabled: schoolId > 0,
  });

export const useSubmitStudentPayment = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitStudentPaymentInput) =>
      submitStudentPayment(schoolId, payload),
    onSuccess: (_data, variables) => {
      toast.success(
        variables.paymentMethod === "CASH"
          ? "Cash counter payment recorded & verified"
          : "Payment submitted and pending school verification",
      );
      qc.invalidateQueries({ queryKey: feeKeys.all });
      qc.invalidateQueries({ queryKey: reportKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to submit payment")),
  });
};

export const useVerifyStudentPayment = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => verifyStudentPayment(schoolId, id),
    onSuccess: () => {
      toast.success("Student payment verified");
      qc.invalidateQueries({ queryKey: feeKeys.all });
      qc.invalidateQueries({ queryKey: reportKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to verify payment")),
  });
};

export const useRejectStudentPayment = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      rejectionReason,
    }: {
      id: number;
      rejectionReason: string;
    }) => rejectStudentPayment(schoolId, id, rejectionReason),
    onSuccess: () => {
      toast.success("Student payment rejected");
      qc.invalidateQueries({ queryKey: feeKeys.all });
      qc.invalidateQueries({ queryKey: reportKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to reject payment")),
  });
};

export const useUpdateStudentFee = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: {
        title?: string;
        amount?: number;
        dueDate?: string;
        status?: FeeStatus;
        description?: string | null;
      };
    }) => {
      const { api } = await import("@/lib/api");
      const res = await api.patch(
        `/schools/${schoolId}/student-fees/${id}`,
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Fee invoice updated");
      qc.invalidateQueries({ queryKey: feeKeys.all });
      qc.invalidateQueries({ queryKey: reportKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to update fee invoice")),
  });
};
