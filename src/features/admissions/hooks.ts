"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "@/features/dashboard/hooks";
import { enrollmentKeys } from "@/features/enrollments/hooks";
import { feeKeys } from "@/features/fees/hooks";
import { guardianKeys } from "@/features/guardians/hooks";
import { reportKeys } from "@/features/reports/hooks";
import { studentKeys } from "@/features/students/hooks";

import {
  approveAdmission,
  confirmCashPayment,
  getAdmissionById,
  getAdmissions,
  rejectAdmission,
  rejectOnlineAdmissionPayment,
  verifyOnlineAdmissionPayment,
} from "./api";

import type {
  ConfirmCashPaymentInput,
  GetAdmissionsParams,
  RejectAdmissionInput,
  RejectOnlinePaymentInput,
  VerifyOnlinePaymentInput,
} from "./types";

// Query Keys
export const admissionKeys = {
  all: ["admissions"] as const,

  list: (schoolId: number, params: GetAdmissionsParams) =>
    [...admissionKeys.all, "list", schoolId, params] as const,

  details: (schoolId: number, admissionId: number) =>
    [...admissionKeys.all, "details", schoolId, admissionId] as const,
};

// Get Admissions List
export function useAdmissions(
  schoolId: number,
  params: GetAdmissionsParams = {},
) {
  return useQuery({
    queryKey: admissionKeys.list(schoolId, params),
    queryFn: () => getAdmissions(schoolId, params),
    enabled: schoolId > 0,
  });
}

// Get Admission Details
export function useAdmissionDetails(schoolId: number, admissionId: number) {
  return useQuery({
    queryKey: admissionKeys.details(schoolId, admissionId),
    queryFn: () => getAdmissionById(schoolId, admissionId),
    enabled: schoolId > 0 && admissionId > 0,
  });
}

// Approve Admission
export function useApproveAdmission(schoolId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (admissionId: number) =>
      approveAdmission(schoolId, admissionId),

    onSuccess: (_data, admissionId) => {
      queryClient.invalidateQueries({
        queryKey: admissionKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: admissionKeys.details(schoolId, admissionId),
      });

      queryClient.invalidateQueries({
        queryKey: studentKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: guardianKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: feeKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: reportKeys.all,
      });
    },
  });
}

// Reject Admission
export function useRejectAdmission(schoolId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      admissionId,
      input,
    }: {
      admissionId: number;
      input: RejectAdmissionInput;
    }) => rejectAdmission(schoolId, admissionId, input),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: admissionKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: admissionKeys.details(schoolId, variables.admissionId),
      });

      queryClient.invalidateQueries({
        queryKey: reportKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
      });
    },
  });
}

// Confirm Cash Payment
export function useConfirmCashPayment(schoolId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      admissionId,
      input,
    }: {
      admissionId: number;
      input?: ConfirmCashPaymentInput;
    }) => confirmCashPayment(schoolId, admissionId, input ?? {}),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: admissionKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: admissionKeys.details(schoolId, variables.admissionId),
      });

      queryClient.invalidateQueries({
        queryKey: reportKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: dashboardKeys.all,
      });
    },
  });
}

export function useVerifyOnlineAdmissionPayment(schoolId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      admissionId,
      input,
    }: {
      admissionId: number;
      input?: VerifyOnlinePaymentInput;
    }) => verifyOnlineAdmissionPayment(schoolId, admissionId, input ?? {}),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: admissionKeys.all });
      queryClient.invalidateQueries({
        queryKey: admissionKeys.details(schoolId, variables.admissionId),
      });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useRejectOnlineAdmissionPayment(schoolId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      admissionId,
      input,
    }: {
      admissionId: number;
      input: RejectOnlinePaymentInput;
    }) => rejectOnlineAdmissionPayment(schoolId, admissionId, input),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: admissionKeys.all });
      queryClient.invalidateQueries({
        queryKey: admissionKeys.details(schoolId, variables.admissionId),
      });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}
