"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { dashboardKeys } from "@/features/dashboard/hooks";
import { reportKeys } from "@/features/reports/hooks";
import { api, getApiErrorMessage } from "@/lib/api";
import type {
  CreateOtherIncomeInput,
  IncomeCategoryFilter,
  IncomeMonthlyChartResponse,
  IncomeSummaryResponse,
  UpdateOtherIncomeInput,
} from "./types";

export const incomeKeys = {
  all: (schoolId: number) => ["income", schoolId] as const,
  summary: (
    schoolId: number,
    params: {
      billingMonth?: string;
      category?: IncomeCategoryFilter;
      startDate?: string;
      endDate?: string;
      search?: string;
    },
  ) => ["income", schoolId, "summary", params] as const,
  chart: (
    schoolId: number,
    billingMonth: string,
    category: IncomeCategoryFilter,
    filters?: { startDate?: string; endDate?: string; search?: string },
  ) =>
    [
      "income",
      schoolId,
      "chart",
      billingMonth,
      category,
      filters ?? {},
    ] as const,
};

export function useIncomeSummary(
  schoolId: number,
  params: {
    billingMonth?: string;
    category?: IncomeCategoryFilter;
    startDate?: string;
    endDate?: string;
    search?: string;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: incomeKeys.summary(schoolId, params),
    enabled: schoolId > 0 && enabled,
    queryFn: async () => {
      const res = await api.get<{ data: IncomeSummaryResponse }>(
        `/schools/${schoolId}/income/summary`,
        { params },
      );
      return res.data.data;
    },
  });
}

export function useIncomeMonthlyChart(
  schoolId: number,
  billingMonth: string,
  category: IncomeCategoryFilter = "ALL",
  filters?: { startDate?: string; endDate?: string; search?: string },
) {
  return useQuery({
    queryKey: incomeKeys.chart(schoolId, billingMonth, category, filters),
    enabled: schoolId > 0 && /^\d{4}-(0[1-9]|1[0-2])$/.test(billingMonth),
    queryFn: async () => {
      const res = await api.get<{ data: IncomeMonthlyChartResponse }>(
        `/schools/${schoolId}/income/chart`,
        {
          params: {
            billingMonth,
            category,
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

export function useCreateOtherIncome(schoolId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateOtherIncomeInput) => {
      const res = await api.post<{
        data: { id: number; billingMonth: string; receiptNo?: string | null };
      }>(`/schools/${schoolId}/income/other`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: incomeKeys.all(schoolId) });
      qc.invalidateQueries({ queryKey: reportKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success("অন্যান্য আয় যুক্ত হয়েছে");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to record out-income entry"));
    },
  });
}

export function useUpdateOtherIncome(schoolId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateOtherIncomeInput;
    }) => {
      const res = await api.patch<{
        data: { id: number; billingMonth: string };
      }>(`/schools/${schoolId}/income/other/${id}`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: incomeKeys.all(schoolId) });
      qc.invalidateQueries({ queryKey: reportKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success("অন্যান্য আয় আপডেট হয়েছে");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to update out-income entry"));
    },
  });
}

export function useDeleteOtherIncome(schoolId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.delete<{ data: { id: number } }>(
        `/schools/${schoolId}/income/other/${id}`,
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: incomeKeys.all(schoolId) });
      qc.invalidateQueries({ queryKey: reportKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.all });
      toast.success("আয়ের এন্ট্রি মুছে ফেলা হয়েছে");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to delete out-income entry"));
    },
  });
}
