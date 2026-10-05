"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  approveCashPayment,
  getPendingCashPayments,
  getSubscriptionPaymentHistory,
  getSubscriptionPaymentSummary,
  initiateSubscriptionPayment,
  rejectCashPayment,
  requestCashPayment,
} from "./api";

// ====================================================
// QUERY KEYS
// ====================================================

export const paymentKeys = {
  all: ["payments"] as const,

  pendingCash: () =>
    [...paymentKeys.all, "pending-cash"] as const,

  summary: () =>
    [...paymentKeys.all, "summary"] as const,

  history: () =>
    [...paymentKeys.all, "history"] as const,
};

// ====================================================
// ADMIN - ONLINE PAYMENT
// ====================================================

export const useInitiateSubscriptionPayment = () => {
  return useMutation({
    mutationFn: (subscriptionId: number) =>
      initiateSubscriptionPayment(subscriptionId),

    onSuccess: (data) => {
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    },
  });
};

// ====================================================
// ADMIN - CASH PAYMENT
// ====================================================

export const useRequestCashPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subscriptionId: number) =>
      requestCashPayment(subscriptionId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.pendingCash(),
      });

      queryClient.invalidateQueries({
        queryKey: paymentKeys.summary(),
      });

      queryClient.invalidateQueries({
        queryKey: paymentKeys.history(),
      });
    },
  });
};

// ====================================================
// SUPER ADMIN - PENDING CASH PAYMENTS
// ====================================================

export const usePendingCashPayments = () => {
  return useQuery({
    queryKey: paymentKeys.pendingCash(),
    queryFn: getPendingCashPayments,
  });
};

// ====================================================
// SUPER ADMIN - APPROVE CASH PAYMENT
// ====================================================

export const useApproveCashPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      remarks,
    }: {
      paymentId: number;
      remarks?: string;
    }) => approveCashPayment(paymentId, remarks),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.pendingCash(),
      });

      queryClient.invalidateQueries({
        queryKey: paymentKeys.summary(),
      });

      queryClient.invalidateQueries({
        queryKey: paymentKeys.history(),
      });
    },
  });
};

// ====================================================
// SUPER ADMIN - REJECT CASH PAYMENT
// ====================================================

export const useRejectCashPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      remarks,
    }: {
      paymentId: number;
      remarks?: string;
    }) => rejectCashPayment(paymentId, remarks),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.pendingCash(),
      });

      queryClient.invalidateQueries({
        queryKey: paymentKeys.summary(),
      });

      queryClient.invalidateQueries({
        queryKey: paymentKeys.history(),
      });
    },
  });
};

// ====================================================
// SUPER ADMIN - PAYMENT SUMMARY
// ====================================================

export const useSubscriptionPaymentSummary = () => {
  return useQuery({
    queryKey: paymentKeys.summary(),
    queryFn: getSubscriptionPaymentSummary,
  });
};

// ====================================================
// SUPER ADMIN - PAYMENT HISTORY
// ====================================================

export const useSubscriptionPaymentHistory = () => {
  return useQuery({
    queryKey: paymentKeys.history(),
    queryFn: getSubscriptionPaymentHistory,
  });
};