import { api } from "@/lib/api";
import { Subscription, SubscriptionListResponse, SubscriptionResponse, SubscriptionStatus } from "./type";


export const subscriptionApi = {
  getAll: async (): Promise<Subscription[]> => {
    const response =
      await api.get<SubscriptionListResponse>(
        "/subscriptions",
      );

    return response.data.data;
  },

  getById: async (
    id: number,
  ): Promise<Subscription> => {
    const response =
      await api.get<SubscriptionResponse>(
        `/subscriptions/${id}`,
      );

    return response.data.data;
  },

  create: async (payload: {
    schoolId: number;
    packageId: number;
    startDate: string;
    endDate: string;
    price: number;
    status?: "ACTIVE" | "PENDING";
    notes?: string;
  }): Promise<Subscription> => {
    const response =
      await api.post<SubscriptionResponse>(
        "/subscriptions",
        payload,
      );

    return response.data.data;
  },

  updateStatus: async (
    id: number,
    status: SubscriptionStatus,
  ): Promise<Subscription> => {
    const response =
      await api.patch<SubscriptionResponse>(
        `/subscriptions/${id}/status`,
        { status },
      );

    return response.data.data;
  },
};