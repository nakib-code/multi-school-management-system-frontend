import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

import type { LoginPayload, User } from "./types";

export const login = async (payload: LoginPayload): Promise<User> => {
  const response = await api.post<ApiResponse<User>>("/auth/login", payload);

  return response.data.data;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<ApiResponse<User>>("/auth/me");

  return response.data.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (
  payload: ChangePasswordPayload,
): Promise<User> => {
  const response = await api.post<ApiResponse<User>>(
    "/auth/change-password",
    payload,
  );
  return response.data.data;
};

export interface UpdateMePayload {
  name?: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

export const updateMe = async (payload: UpdateMePayload): Promise<User> => {
  const response = await api.patch<ApiResponse<User>>("/auth/me", payload);
  return response.data.data;
};
