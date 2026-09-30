"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { subscriptionApi } from "./api";
import { SubscriptionStatus } from "./type";

export const subscriptionKeys = {
  all: ["super-admin", "subscriptions"] as const,

  lists: () =>
    [...subscriptionKeys.all, "list"] as const,

  details: () =>
    [...subscriptionKeys.all, "detail"] as const,

  detail: (id: number) =>
    [...subscriptionKeys.details(), id] as const,
};

export const useSubscriptions = () => {
  return useQuery({
    queryKey: subscriptionKeys.lists(),
    queryFn: subscriptionApi.getAll,
  });
};

export const useSubscription = (id: number) => {
  return useQuery({
    queryKey: subscriptionKeys.detail(id),
    queryFn: () => subscriptionApi.getById(id),
    enabled: Boolean(id),
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionApi.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.lists(),
      });
    },
  });
};

export const useUpdateSubscriptionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: SubscriptionStatus;
    }) =>
      subscriptionApi.updateStatus(id, status),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.detail(
          variables.id,
        ),
      });
    },
  });
};