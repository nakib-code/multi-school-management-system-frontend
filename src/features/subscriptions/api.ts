import { api } from "@/lib/api";
import type {
  MySubscriptionResponse,
  SelectPackageResponse,
} from "./types";

export const getMySubscription =
  async (): Promise<MySubscriptionResponse["data"]> => {
    const response = await api.get<MySubscriptionResponse>(
      "/subscriptions/me",
    );

    return response.data.data;
  };

export const selectPackage = async (
  packageId: number,
): Promise<SelectPackageResponse["data"]> => {
  const response = await api.post<SelectPackageResponse>(
    "/subscriptions/select-package",
    {
      packageId,
    },
  );

  return response.data.data;
};