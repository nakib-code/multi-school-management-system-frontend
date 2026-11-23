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
    mutationFn: (payload: CreateManagerInput) => createManager(schoolId, payload),
    onSuccess: () => {
      toast.success("Manager created successfully");
      qc.invalidateQueries({ queryKey: managerKeys.list(schoolId) });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to create manager")),
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
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to delete manager")),
  });
};
