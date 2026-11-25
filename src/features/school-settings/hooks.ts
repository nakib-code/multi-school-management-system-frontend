"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { MobileAccountType } from "@/features/payments/types";
import { api, getApiErrorMessage } from "@/lib/api";

export interface SchoolFeatures {
  schoolId: number;
  hasGeneralSection: boolean;
  hasHefzSection: boolean;
  hasPublicWebsite: boolean;
  hasOnlineAdmission: boolean;
  hasTeacherPayroll: boolean;
  smsEnabled: boolean;
}

export type UpdateSchoolFeaturesInput = Partial<
  Omit<SchoolFeatures, "schoolId">
>;

export interface SchoolPaymentMethods {
  schoolId: number;
  bkashNumber: string | null;
  bkashType: MobileAccountType;
  nagadNumber: string | null;
  nagadType: MobileAccountType;
  rocketNumber: string | null;
  rocketType: MobileAccountType;
  feePaymentInstruction: string | null;
}

export type UpdateSchoolPaymentMethodsInput = Partial<
  Omit<SchoolPaymentMethods, "schoolId">
>;

export const schoolSettingKeys = {
  features: (schoolId: number) =>
    ["school-settings", schoolId, "features"] as const,
  paymentMethods: (schoolId?: number) =>
    ["school-settings", schoolId ?? "me", "payment-methods"] as const,
};

export function useSchoolFeatures(schoolId: number) {
  return useQuery({
    queryKey: schoolSettingKeys.features(schoolId),
    enabled: schoolId > 0,
    queryFn: async () => {
      const res = await api.get<{ data: SchoolFeatures }>(
        `/school-settings/${schoolId}/features`,
      );
      return res.data.data;
    },
  });
}

export function useUpdateSchoolFeatures(schoolId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateSchoolFeaturesInput) => {
      const res = await api.patch<{ data: SchoolFeatures }>(
        `/school-settings/${schoolId}/features`,
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolSettingKeys.features(schoolId) });
      toast.success("Institution module controls updated");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(err, "Failed to update institution modules"),
      );
    },
  });
}

export function useSchoolPaymentMethods(schoolId?: number) {
  return useQuery({
    queryKey: schoolSettingKeys.paymentMethods(schoolId),
    queryFn: async () => {
      const url = schoolId
        ? `/schools/${schoolId}/settings/payment-methods`
        : "/school-settings/payment-methods";
      const res = await api.get<{ data: SchoolPaymentMethods }>(url);
      return res.data.data;
    },
  });
}

export function useUpdateSchoolPaymentMethods(schoolId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateSchoolPaymentMethodsInput) => {
      const res = await api.patch<{ data: SchoolPaymentMethods }>(
        "/school-settings/payment-methods",
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: schoolSettingKeys.paymentMethods(schoolId),
      });
      qc.invalidateQueries({
        queryKey: schoolSettingKeys.paymentMethods(undefined),
      });
      toast.success("School mobile banking payment methods saved");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(err, "Failed to update school payment methods"),
      );
    },
  });
}
