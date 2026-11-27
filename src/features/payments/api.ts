import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  MobilePaymentMethod,
  PaymentMethodsResponse,
  SubmitSubscriptionPaymentInput,
  SubscriptionPaymentRecord,
  SubscriptionPaymentStatus,
  SubscriptionPaymentSummary,
} from "./types";

export const getPaymentMethods = async (): Promise<PaymentMethodsResponse> => {
  const res =
    await api.get<ApiResponse<PaymentMethodsResponse>>("/payments/methods");
  return res.data.data;
};

export const submitSubscriptionPayment = async (
  subscriptionId: number,
  payload: SubmitSubscriptionPaymentInput,
): Promise<SubscriptionPaymentRecord> => {
  const res = await api.post<ApiResponse<SubscriptionPaymentRecord>>(
    `/subscriptions/${subscriptionId}/payments`,
    payload,
  );
  return res.data.data;
};

export const getPendingSubscriptionPayments = async (): Promise<
  SubscriptionPaymentRecord[]
> => {
  const res = await api.get<ApiResponse<SubscriptionPaymentRecord[]>>(
    "/payments/subscription/pending",
  );
  return res.data.data;
};

export const verifySubscriptionPayment = async (
  paymentId: number,
): Promise<{
  payment: SubscriptionPaymentRecord;
  subscription: { id: number; status: string };
}> => {
  const res = await api.patch<
    ApiResponse<{
      payment: SubscriptionPaymentRecord;
      subscription: { id: number; status: string };
    }>
  >(`/payments/subscription/${paymentId}/verify`);
  return res.data.data;
};

export const rejectSubscriptionPayment = async (
  paymentId: number,
  rejectionReason: string,
): Promise<SubscriptionPaymentRecord> => {
  const res = await api.patch<ApiResponse<SubscriptionPaymentRecord>>(
    `/payments/subscription/${paymentId}/reject`,
    { rejectionReason },
  );
  return res.data.data;
};

export const getSubscriptionPaymentSummary =
  async (): Promise<SubscriptionPaymentSummary> => {
    const res = await api.get<ApiResponse<SubscriptionPaymentSummary>>(
      "/payments/subscription/summary",
    );
    return res.data.data;
  };

export const getSubscriptionPaymentHistory = async (params?: {
  status?: SubscriptionPaymentStatus;
  paymentMethod?: MobilePaymentMethod;
  schoolId?: number;
}): Promise<SubscriptionPaymentRecord[]> => {
  const res = await api.get<ApiResponse<SubscriptionPaymentRecord[]>>(
    "/payments/subscription/history",
    { params },
  );
  return res.data.data;
};
