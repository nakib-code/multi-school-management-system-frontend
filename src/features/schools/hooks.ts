"use client";

import { useMutation } from "@tanstack/react-query";

import {
  createSchool,
  verifyAdminEmail,
} from "./api";

import type {
  CreateSchoolPayload,
  VerifyAdminEmailPayload,
} from "./types";

export const useCreateSchool = () => {
  return useMutation({
    mutationFn: (payload: CreateSchoolPayload) =>
      createSchool(payload),
  });
};

export const useVerifyAdminEmail = () => {
  return useMutation({
    mutationFn: (payload: VerifyAdminEmailPayload) =>
      verifyAdminEmail(payload),
  });
};


import { useQuery } from "@tanstack/react-query";

import { getSchools, type GetSchoolsParams } from "./api";

export const useSchools = (params: GetSchoolsParams = {}) =>
  useQuery({
    queryKey: ["schools", "list", params],
    queryFn: () => getSchools(params),
  });