"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { MobileAccountType } from "@/features/payments/types";
import { api, getApiErrorMessage } from "@/lib/api";

export interface PlatformSetting {
  id: number;
  platformName: string;
  supportPhone: string | null;
  bkashNumber: string | null;
  bkashType: MobileAccountType;
  nagadNumber: string | null;
  nagadType: MobileAccountType;
  rocketNumber: string | null;
  rocketType: MobileAccountType;
  paymentInstruction: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePlatformSettingInput {
  platformName?: string;
  supportPhone?: string | null;
  bkashNumber?: string | null;
  bkashType?: MobileAccountType;
  nagadNumber?: string | null;
  nagadType?: MobileAccountType;
  rocketNumber?: string | null;
  rocketType?: MobileAccountType;
  paymentInstruction?: string | null;
}

export const platformSettingKeys = {
  all: ["platform-settings"] as const,
};

export function usePlatformSettings() {
  return useQuery({
    queryKey: platformSettingKeys.all,
    queryFn: async () => {
      const res = await api.get<{ data: PlatformSetting }>(
        "/platform-settings",
      );
      return res.data.data;
    },
  });
}

export function useUpdatePlatformSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdatePlatformSettingInput) => {
      const res = await api.patch<{ data: PlatformSetting }>(
        "/platform-settings",
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: platformSettingKeys.all });
      qc.invalidateQueries({ queryKey: ["payments", "methods"] });
      toast.success("Platform payment settings updated successfully");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(err, "Failed to update platform payment settings"),
      );
    },
  });
}
