"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { MobileAccountType } from "@/features/payments/types";
import { api, getApiErrorMessage } from "@/lib/api";

export interface SchoolFeatures {
  schoolId: number;
  hasGeneralSection: boolean;
  hasHefzSection: boolean;
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

export interface SchoolProfile {
  id: number;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo: string | null;
  status: string;
}

export function useSchoolProfile(schoolId: number) {
  return useQuery({
    queryKey: ["schools", schoolId, "profile"] as const,
    enabled: schoolId > 0,
    queryFn: async () => {
      const res = await api.get<{ data: SchoolProfile }>(
        `/schools/${schoolId}/profile`,
      );
      return res.data.data;
    },
  });
}

export function useUpdateSchoolProfile(schoolId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: Partial<
        Pick<SchoolProfile, "name" | "email" | "phone" | "address" | "logo">
      >,
    ) => {
      const res = await api.patch<{ data: SchoolProfile }>(
        `/schools/${schoolId}/profile`,
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schools", schoolId, "profile"] });
      toast.success("Institution profile updated");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to update school profile"));
    },
  });
}

export interface WebsiteConnectionSettings {
  schoolId: number;
  schoolName: string;
  schoolCode: string;
  externalWebsiteUrl: string | null;
  hasConnectionKey: boolean;
  keyPreview: string | null;
  landingAdminEmail: string | null;
  hasLandingAdminPassword: boolean;
  apiBaseUrl: string;
  hasOnlineAdmission: boolean;
}

export interface RotateWebsiteKeyResponse extends WebsiteConnectionSettings {
  connectionKey: string;
}

export function useWebsiteConnection(schoolId: number) {
  return useQuery({
    queryKey: ["schools", schoolId, "website-connection"] as const,
    enabled: schoolId > 0,
    queryFn: async () => {
      const res = await api.get<{ data: WebsiteConnectionSettings }>(
        `/schools/${schoolId}/settings/website-connection`,
      );
      return res.data.data;
    },
  });
}

export function useUpdateWebsiteConnection(schoolId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      externalWebsiteUrl?: string | null;
      landingAdminEmail?: string | null;
      landingAdminPassword?: string;
    }) => {
      const res = await api.patch<{ data: WebsiteConnectionSettings }>(
        `/schools/${schoolId}/settings/website-connection`,
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["schools", schoolId, "website-connection"],
      });
      toast.success("External website settings saved");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(err, "Failed to update external website settings"),
      );
    },
  });
}

export function useRotateWebsiteKey(schoolId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<{ data: RotateWebsiteKeyResponse }>(
        `/schools/${schoolId}/settings/website-connection/rotate-key`,
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["schools", schoolId, "website-connection"],
      });
      toast.success("New website connection key generated");
    },
    onError: (err) => {
      toast.error(
        getApiErrorMessage(err, "Failed to generate website connection key"),
      );
    },
  });
}
