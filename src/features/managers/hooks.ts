"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import { createManager, deleteManager, getManagers } from "./api";
import type { CreateManagerInput } from "./types";

export const managerKeys = {
  all: ["managers"] as const,
  list: (schoolId: number) => [...managerKeys.all, schoolId] as const,
};

export const useManagers = (schoolId: number) =>
  useQuery({
    queryKey: managerKeys.list(schoolId),
    queryFn: () => getManagers(schoolId),
    enabled: schoolId > 0,
  });

export const useCreateManager = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateManagerInput) =>
      createManager(schoolId, payload),
    onSuccess: () => {
      toast.success("Manager created successfully");
      qc.invalidateQueries({ queryKey: managerKeys.list(schoolId) });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to create manager")),
  });
};

export const useDeleteManager = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteManager(schoolId, id),
    onSuccess: () => {
      toast.success("Manager deleted");
      qc.invalidateQueries({ queryKey: managerKeys.list(schoolId) });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to delete manager")),
  });
};

export interface ResetManagerPasswordResponse {
  managerId: number;
  name: string;
  email: string;
  phone: string | null;
  temporaryPassword: string;
}

export const useUpdateManager = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: {
        name?: string;
        phone?: string;
        designation?: string;
        department?: string;
      };
    }) => {
      const { api } = await import("@/lib/api");
      const res = await api.patch(
        `/schools/${schoolId}/managers/${id}`,
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Manager updated successfully");
      qc.invalidateQueries({ queryKey: managerKeys.list(schoolId) });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to update manager")),
  });
};

export const useResetManagerPassword = (schoolId: number) =>
  useMutation({
    mutationFn: async ({
      managerId,
      newPassword,
    }: {
      managerId: number;
      newPassword?: string;
    }) => {
      const { api } = await import("@/lib/api");
      const res = await api.post<{ data: ResetManagerPasswordResponse }>(
        `/schools/${schoolId}/managers/${managerId}/reset-password`,
        newPassword ? { newPassword } : {},
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Manager password reset successfully");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to reset manager password")),
  });
