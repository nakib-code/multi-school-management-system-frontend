"use client";

import { useQuery } from "@tanstack/react-query";

import { getSchoolUserSummary, getSchoolUsers } from "./api";
import type { GetSchoolUsersParams } from "./types";

export const schoolUsersKeys = {
  all: ["school-users"] as const,

  summary: (schoolId: number) =>
    [...schoolUsersKeys.all, "summary", schoolId] as const,

  list: (schoolId: number, params: GetSchoolUsersParams) =>
    [...schoolUsersKeys.all, "list", schoolId, params] as const,
};

export const useSchoolUserSummary = (schoolId: number) =>
  useQuery({
    queryKey: schoolUsersKeys.summary(schoolId),
    queryFn: () => getSchoolUserSummary(schoolId),
    enabled: Number.isInteger(schoolId) && schoolId > 0,
  });

export const useSchoolUsers = (
  schoolId: number,
  params: GetSchoolUsersParams = {},
) =>
  useQuery({
    queryKey: schoolUsersKeys.list(schoolId, params),
    queryFn: () => getSchoolUsers(schoolId, params),
    enabled: Number.isInteger(schoolId) && schoolId > 0,
  });