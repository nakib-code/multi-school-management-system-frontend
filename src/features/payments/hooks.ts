"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  approveCashPayment,
  getPendingCashPayments,
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
  return useMutation({
    mutationFn: (subscriptionId: number) =>
      requestCashPayment(subscriptionId),
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
    },
  });
};
