"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { BillingCycle, PackageFeature } from "@/features/super-admin/packages/type";
import { api, getApiErrorMessage } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

export interface MyCustomPackageRequest {
  id: number;
  schoolId: number;
  requestedStudentLimit: number;
  requestedPrice: number;
  billingCycle: BillingCycle;
  description: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reviewNote: string | null;
  createdAt: string;
  features: Array<{ feature: PackageFeature; enabled: boolean }>;
}

export interface CreateCustomPackageRequestInput {
  schoolId: number;
  requestedStudentLimit: number;
  requestedPrice: number;
  billingCycle: BillingCycle;
  description?: string;
  features: Array<{ feature: PackageFeature; enabled: boolean }>;
}

export const useMyCustomPackageRequests = () =>
  useQuery({
    queryKey: ["my-custom-package-requests"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<MyCustomPackageRequest[]>>(
        "/custom-package-requests/my",
      );
      return res.data.data;
    },
  });

export const useCreateCustomPackageRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCustomPackageRequestInput) => {
      const res = await api.post<ApiResponse<MyCustomPackageRequest>>(
        "/custom-package-requests",
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Custom package request submitted");
      qc.invalidateQueries({ queryKey: ["my-custom-package-requests"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to submit request")),
  });
};

export const useCancelCustomPackageRequest = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.patch<ApiResponse<MyCustomPackageRequest>>(
        `/custom-package-requests/${id}/cancel`,
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Custom package request cancelled");
      qc.invalidateQueries({ queryKey: ["my-custom-package-requests"] });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to cancel request")),
  });
};
