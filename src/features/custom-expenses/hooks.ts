"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dashboardKeys } from "@/features/dashboard/hooks";
import { reportKeys } from "@/features/reports/hooks";
import { api, getApiErrorMessage } from "@/lib/api";
import type {
  CreateCustomExpenseEntryInput,
  CreateCustomExpenseSheetInput,
  CustomExpenseEntry,
  CustomExpenseMonthlyChart,
  CustomExpenseSheet,
  UpdateCustomExpenseEntryInput,
  UpdateCustomExpenseSheetFieldsInput,
} from "./types";

export const customExpenseKeys = {
  all: (schoolId: number) => ["custom-expenses", schoolId] as const,
  sheets: (
    schoolId: number,
    options?: { includeInactive?: boolean; billingMonth?: string },
  ) => ["custom-expenses", schoolId, "sheets", options ?? {}] as const,
  chart: (
    schoolId: number,
    sheetId: number,
    billingMonth: string,
    filters?: { startDate?: string; endDate?: string; search?: string },
  ) =>
    [
      "custom-expenses",
      schoolId,
      "chart",
      sheetId,
      billingMonth,
      filters ?? {},
    ] as const,
};

export function useCustomExpenseSheets(
  schoolId: number,
  options?: { includeInactive?: boolean; billingMonth?: string },
) {
  return useQuery({
    queryKey: customExpenseKeys.sheets(schoolId, options),
    enabled: schoolId > 0,
    queryFn: async () => {
      const res = await api.get<{ data: CustomExpenseSheet[] }>(
        `/schools/${schoolId}/custom-expenses/sheets`,
        {
          params: {
            ...(options?.includeInactive ? { includeInactive: "true" } : {}),
            ...(options?.billingMonth
              ? { billingMonth: options.billingMonth }
              : {}),
          },
        },
      );
      return res.data.data;
    },
  });
}

export function useCustomExpenseMonthlyChart(
  schoolId: number,
  sheetId: number,
  billingMonth: string,
  filters?: { startDate?: string; endDate?: string; search?: string },
) {
  return useQuery({
    queryKey: customExpenseKeys.chart(schoolId, sheetId, billingMonth, filters),
    enabled:
      schoolId > 0 &&
      sheetId > 0 &&
      /^\d{4}-(0[1-9]|1[0-2])$/.test(billingMonth),
    queryFn: async () => {
      const res = await api.get<{ data: CustomExpenseMonthlyChart }>(
        `/schools/${schoolId}/custom-expenses/sheets/${sheetId}/chart`,
        {
          params: {
            billingMonth,
            ...(filters?.startDate ? { startDate: filters.startDate } : {}),
            ...(filters?.endDate ? { endDate: filters.endDate } : {}),
            ...(filters?.search ? { search: filters.search } : {}),
          },
        },
      );
      return res.data.data;
    },
  });
}

export function useCreateCustomExpenseSheet(schoolId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateCustomExpenseSheetInput) => {
      const res = await api.post<{ data: CustomExpenseSheet }>(
        `/schools/${schoolId}/custom-expenses/sheets`,
        payload,
      );
      return res.data.data;
    },
    onSuccess: (sheet) => {
      qc.invalidateQueries({ queryKey: customExpenseKeys.all(schoolId) });
      qc.invalidateQueries({ queryKey: reportKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success(`"${sheet.name}" তৈরি হয়েছে`);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to create custom sheet"));
    },
  });
}

export function useUpdateCustomExpenseSheetFields(schoolId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sheetId,
      payload,
    }: {
      sheetId: number;
      payload: UpdateCustomExpenseSheetFieldsInput;
    }) => {
      const res = await api.patch<{ data: CustomExpenseSheet }>(
        `/schools/${schoolId}/custom-expenses/sheets/${sheetId}/fields`,
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customExpenseKeys.all(schoolId) });
      qc.invalidateQueries({ queryKey: reportKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success("কলাম ও শিট তথ্য আপডেট হয়েছে");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to update sheet columns"));
    },
  });
}

export function useDeleteCustomExpenseSheet(schoolId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sheetId,
      archive = false,
    }: {
      sheetId: number;
      archive?: boolean;
    }) => {
      const res = await api.delete<{
        data: { id: number; name: string; archived: boolean };
      }>(`/schools/${schoolId}/custom-expenses/sheets/${sheetId}`, {
        params: archive ? { archive: "true" } : undefined,
      });
      return res.data.data;
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: customExpenseKeys.all(schoolId) });
      qc.invalidateQueries({ queryKey: reportKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success(
        res.archived
          ? `"${res.name}" আর্কাইভ করা হয়েছে`
          : `"${res.name}" মুছে ফেলা হয়েছে`,
      );
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to delete sheet"));
    },
  });
}

export function useRestoreCustomExpenseSheet(schoolId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sheetId: number) => {
      const res = await api.patch<{ data: CustomExpenseSheet }>(
        `/schools/${schoolId}/custom-expenses/sheets/${sheetId}/restore`,
      );
      return res.data.data;
    },
    onSuccess: (sheet) => {
      qc.invalidateQueries({ queryKey: customExpenseKeys.all(schoolId) });
      qc.invalidateQueries({ queryKey: reportKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success(`"${sheet.name}" পুনরুদ্ধার করা হয়েছে`);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to restore sheet"));
    },
  });
}

export function useCreateCustomExpenseEntry(schoolId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sheetId,
      payload,
    }: {
      sheetId: number;
      payload: CreateCustomExpenseEntryInput;
    }) => {
      const res = await api.post<{ data: CustomExpenseEntry }>(
        `/schools/${schoolId}/custom-expenses/sheets/${sheetId}/entries`,
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customExpenseKeys.all(schoolId) });
      qc.invalidateQueries({ queryKey: reportKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success("খরচ / বিল এন্ট্রি যুক্ত হয়েছে");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to add expense entry"));
    },
  });
}

export function useUpdateCustomExpenseEntry(schoolId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sheetId,
      entryId,
      payload,
    }: {
      sheetId: number;
      entryId: number;
      payload: UpdateCustomExpenseEntryInput;
    }) => {
      const res = await api.patch<{ data: CustomExpenseEntry }>(
        `/schools/${schoolId}/custom-expenses/sheets/${sheetId}/entries/${entryId}`,
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customExpenseKeys.all(schoolId) });
      qc.invalidateQueries({ queryKey: reportKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success("এন্ট্রি আপডেট হয়েছে");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to update expense entry"));
    },
  });
}

export function useDeleteCustomExpenseEntry(schoolId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sheetId,
      entryId,
    }: {
      sheetId: number;
      entryId: number;
    }) => {
      const res = await api.delete<{ data: { id: number } }>(
        `/schools/${schoolId}/custom-expenses/sheets/${sheetId}/entries/${entryId}`,
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customExpenseKeys.all(schoolId) });
      qc.invalidateQueries({ queryKey: reportKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success("এন্ট্রি মুছে ফেলা হয়েছে");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to delete expense entry"));
    },
  });
}
