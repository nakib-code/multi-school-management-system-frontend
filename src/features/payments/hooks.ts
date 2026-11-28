"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dashboardKeys } from "@/features/dashboard/hooks";
import { reportKeys } from "@/features/reports/hooks";
import { subscriptionKeys } from "@/features/subscriptions/hooks";
import { subscriptionKeys as superAdminSubscriptionKeys } from "@/features/super-admin/subscriptions/use-subscriptions";
import { getApiErrorMessage } from "@/lib/api";
import {
  getPaymentMethods,
  getPendingSubscriptionPayments,
  getSubscriptionPaymentHistory,
  getSubscriptionPaymentSummary,
  rejectSubscriptionPayment,
  submitSubscriptionPayment,
  verifySubscriptionPayment,
} from "./api";
import type {
  MobilePaymentMethod,
  SubmitSubscriptionPaymentInput,
  SubscriptionPaymentStatus,
} from "./types";

export const paymentKeys = {
  all: ["payments"] as const,
  methods: () => [...paymentKeys.all, "methods"] as const,
  pending: () => [...paymentKeys.all, "pending"] as const,
  summary: () => [...paymentKeys.all, "summary"] as const,
  history: (params?: {
    status?: SubscriptionPaymentStatus;
    paymentMethod?: MobilePaymentMethod;
    schoolId?: number;
  }) => [...paymentKeys.all, "history", params] as const,
};

export const usePaymentMethods = () =>
  useQuery({
    queryKey: paymentKeys.methods(),
    queryFn: getPaymentMethods,
  });

export const useSubmitSubscriptionPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      subscriptionId,
      payload,
    }: {
      subscriptionId: number;
      payload: SubmitSubscriptionPaymentInput;
    }) => submitSubscriptionPayment(subscriptionId, payload),
    onSuccess: () => {
      toast.success("Payment submitted and pending Super Admin verification");
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.me() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to submit payment"));
    },
  });
};

export const usePendingSubscriptionPayments = () =>
  useQuery({
    queryKey: paymentKeys.pending(),
    queryFn: getPendingSubscriptionPayments,
  });

export const useVerifySubscriptionPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: number) => verifySubscriptionPayment(paymentId),
    onSuccess: () => {
      toast.success("Payment verified and subscription activated");
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({
        queryKey: superAdminSubscriptionKeys.all,
      });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to verify payment"));
    },
  });
};

export const useRejectSubscriptionPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      paymentId,
      rejectionReason,
    }: {
      paymentId: number;
      rejectionReason: string;
    }) => rejectSubscriptionPayment(paymentId, rejectionReason),
    onSuccess: () => {
      toast.success("Payment rejected");
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({
        queryKey: superAdminSubscriptionKeys.all,
      });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to reject payment"));
    },
  });
};

export const useSubscriptionPaymentSummary = () =>
  useQuery({
    queryKey: paymentKeys.summary(),
    queryFn: getSubscriptionPaymentSummary,
  });

export const useSubscriptionPaymentHistory = (params?: {
  status?: SubscriptionPaymentStatus;
  paymentMethod?: MobilePaymentMethod;
  schoolId?: number;
}) =>
  useQuery({
    queryKey: paymentKeys.history(params),
    queryFn: () => getSubscriptionPaymentHistory(params),
  });
