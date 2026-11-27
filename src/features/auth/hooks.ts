"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type ChangePasswordPayload,
  changePassword,
  getMe,
  login,
  logout,
  type UpdateMePayload,
  updateMe,
} from "./api";

import type { LoginPayload } from "./types";

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: getMe,
    retry: false,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),

    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me(), user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,

    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: authKeys.all,
      });
    },
  });
};

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(authKeys.me(), updatedUser);
    },
  });
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMePayload) => updateMe(payload),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(authKeys.me(), updatedUser);
    },
  });
};
