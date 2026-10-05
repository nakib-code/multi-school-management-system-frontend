"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getSchoolUserSummary,
  getSchoolUsers,
} from "./api";

import type { GetSchoolUsersParams } from "./types";

export const schoolUsersKeys = {
  all: ["school-users"] as const,

  summary: (schoolId: number) =>
    [...schoolUsersKeys.all, "summary", schoolId] as const,

  list: (
    schoolId: number,
    params: GetSchoolUsersParams = {},
  ) => [...schoolUsersKeys.all, "list", schoolId, params] as const,
};

export const useSchoolUserSummary = (
  schoolId: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: schoolUsersKeys.summary(schoolId),
    queryFn: () => getSchoolUserSummary(schoolId),
    enabled:
      enabled &&
      Number.isInteger(schoolId) &&
      schoolId > 0,
    staleTime: 60_000,
  });
};

export const useSchoolUsers = (
  schoolId: number,
  params: GetSchoolUsersParams = {},
  enabled = true,
) => {
  return useQuery({
    queryKey: schoolUsersKeys.list(schoolId, params),
    queryFn: () => getSchoolUsers(schoolId, params),
    enabled:
      enabled &&
      Number.isInteger(schoolId) &&
      schoolId > 0,
    staleTime: 30_000,
  });
};
