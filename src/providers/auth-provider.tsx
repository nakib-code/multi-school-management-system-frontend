"use client";

import { createContext, useContext, useMemo } from "react";

import {
  useCurrentUser,
  useLogin,
  useLogout,
} from "@/features/auth/hooks";

import type { LoginPayload, User } from "@/features/auth/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data: user,
    isLoading,
  } = useCurrentUser();

  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,

      isLoading:
        isLoading ||
        loginMutation.isPending ||
        logoutMutation.isPending,

      isAuthenticated: !!user,

      login: async (payload) => {
        return loginMutation.mutateAsync(payload);
      },

      logout: async () => {
        await logoutMutation.mutateAsync();
      },
    }),
    [
      user,
      isLoading,
      loginMutation,
      logoutMutation,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}