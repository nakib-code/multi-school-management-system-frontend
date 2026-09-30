"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { packageApi } from "./api";

import type {
  CreatePackagePayload,
  UpdatePackagePayload,
} from "./type";

export const packageKeys = {
  all: ["super-admin", "packages"] as const,

  lists: () => [...packageKeys.all, "list"] as const,

  details: () => [...packageKeys.all, "detail"] as const,

  detail: (id: number) =>
    [...packageKeys.details(), id] as const,
};

export const usePackages = () => {
  return useQuery({
    queryKey: packageKeys.lists(),
    queryFn: packageApi.getAll,
  });
};

export const usePackage = (id: number) => {
  return useQuery({
    queryKey: packageKeys.detail(id),
    queryFn: () => packageApi.getById(id),
    enabled: Boolean(id),
  });
};

export const useCreatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePackagePayload) =>
      packageApi.create(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: packageKeys.lists(),
      });
    },
  });
};

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdatePackagePayload;
    }) => packageApi.update(id, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: packageKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: packageKeys.detail(variables.id),
      });
    },
  });
};

export const useUpdatePackageStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      isActive,
    }: {
      id: number;
      isActive: boolean;
    }) => packageApi.updateStatus(id, isActive),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: packageKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: packageKeys.detail(variables.id),
      });
    },
  });
};