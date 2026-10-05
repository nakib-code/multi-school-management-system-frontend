import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

import type {
  CashPaymentActionResponse,
  CashPaymentRequestResponse,
  InitiateSubscriptionPaymentResponse,
  PendingCashPaymentsResponse,
} from "./types";

// ====================================================
// ADMIN - ONLINE SUBSCRIPTION PAYMENT
// ====================================================

export const initiateSubscriptionPayment = async (
  subscriptionId: number,
): Promise<InitiateSubscriptionPaymentResponse> => {
  const response = await api.post<
    ApiResponse<InitiateSubscriptionPaymentResponse>
  >(`/subscriptions/${subscriptionId}/pay`);

  return response.data.data;
};

// ====================================================
// ADMIN - CASH PAYMENT REQUEST
// ====================================================

export const requestCashPayment = async (
  subscriptionId: number,
): Promise<CashPaymentRequestResponse> => {
  const response = await api.post<
    ApiResponse<CashPaymentRequestResponse>
  >(`/subscriptions/${subscriptionId}/cash-payment`);

  return response.data.data;
};

// ====================================================
// SUPER ADMIN - GET PENDING CASH PAYMENTS
// ====================================================

export const getPendingCashPayments =
  async (): Promise<PendingCashPaymentsResponse> => {
    const response = await api.get<
      ApiResponse<PendingCashPaymentsResponse>
    >("/payments/subscription/cash/pending");

    return response.data.data;
  };

// ====================================================
// SUPER ADMIN - APPROVE CASH PAYMENT
// ====================================================

export const approveCashPayment = async (
  paymentId: number,
  remarks?: string,
): Promise<CashPaymentActionResponse> => {
  const response = await api.patch<
    ApiResponse<CashPaymentActionResponse>
  >(`/payments/subscription/cash/${paymentId}/approve`, {
    remarks: remarks?.trim() || undefined,
  });

  return response.data.data;
};

// ====================================================
// SUPER ADMIN - REJECT CASH PAYMENT
// ====================================================

export const rejectCashPayment = async (
  paymentId: number,
  remarks?: string,
): Promise<CashPaymentActionResponse> => {
  const response = await api.patch<
    ApiResponse<CashPaymentActionResponse>
  >(`/payments/subscription/cash/${paymentId}/reject`, {
    remarks: remarks?.trim() || undefined,
  });

  return response.data.data;
};
