"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getMySubscription,
  selectPackage,
} from "./api";

export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  me: () => [...subscriptionKeys.all, "me"] as const,
};

export function useMySubscription() {
  return useQuery({
    queryKey: subscriptionKeys.me(),
    queryFn: getMySubscription,
  });
}

export function useSelectPackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (packageId: number) => selectPackage(packageId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: subscriptionKeys.me(),
      });
    },
  });
}