"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { customPackageRequestApi } from "./api";
import { ReviewCustomPackageRequestPayload } from "./type";



export const customPackageRequestKeys = {
  all: ["super-admin", "custom-package-requests"] as const,

  lists: () =>
    [...customPackageRequestKeys.all, "list"] as const,

  details: () =>
    [...customPackageRequestKeys.all, "detail"] as const,

  detail: (id: number) =>
    [...customPackageRequestKeys.details(), id] as const,
};

export const useCustomPackageRequests = () => {
  return useQuery({
    queryKey: customPackageRequestKeys.lists(),
    queryFn: customPackageRequestApi.getAll,
  });
};

export const useCustomPackageRequest = (id: number) => {
  return useQuery({
    queryKey: customPackageRequestKeys.detail(id),
    queryFn: () => customPackageRequestApi.getById(id),
    enabled: Boolean(id),
  });
};

export const useReviewCustomPackageRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ReviewCustomPackageRequestPayload;
    }) =>
      customPackageRequestApi.review(id, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: customPackageRequestKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: customPackageRequestKeys.detail(
          variables.id,
        ),
      });
    },
  });
};