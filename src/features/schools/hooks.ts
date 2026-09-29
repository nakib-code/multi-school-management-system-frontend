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