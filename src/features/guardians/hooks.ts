"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import {
  createGuardian,
  deleteGuardian,
  getGuardians,
  linkStudentToGuardian,
  resetGuardianPassword,
  unlinkStudentFromGuardian,
} from "./api";
import type {
  CreateGuardianInput,
  ResetGuardianPasswordInput,
} from "./types";

export const guardianKeys = {
  all: ["guardians"] as const,
  list: (schoolId: number) => [...guardianKeys.all, schoolId] as const,
};

export const useGuardians = (schoolId: number) =>
  useQuery({
    queryKey: guardianKeys.list(schoolId),
    queryFn: () => getGuardians(schoolId),
    enabled: schoolId > 0,
  });

export const useCreateGuardian = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGuardianInput) => createGuardian(schoolId, payload),
    onSuccess: () => {
      toast.success("Guardian created successfully");
      qc.invalidateQueries({ queryKey: guardianKeys.list(schoolId) });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to create guardian")),
  });
};

export const useLinkStudentToGuardian = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ guardianId, studentId }: { guardianId: number; studentId: number }) =>
      linkStudentToGuardian(schoolId, guardianId, studentId),
    onSuccess: () => {
      toast.success("Student linked to guardian");
      qc.invalidateQueries({ queryKey: guardianKeys.list(schoolId) });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to link student")),
  });
};

export const useUnlinkStudentFromGuardian = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ guardianId, studentId }: { guardianId: number; studentId: number }) =>
      unlinkStudentFromGuardian(schoolId, guardianId, studentId),
    onSuccess: () => {
      toast.success("Student unlinked");
      qc.invalidateQueries({ queryKey: guardianKeys.list(schoolId) });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to unlink student")),
  });
};

export const useResetGuardianPassword = (schoolId: number) => {
  return useMutation({
    mutationFn: ({
      guardianId,
      payload,
    }: {
      guardianId: number;
      payload: ResetGuardianPasswordInput;
    }) => resetGuardianPassword(schoolId, guardianId, payload),
    onSuccess: () => {
      toast.success("Guardian password updated");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to reset guardian password")),
  });
};

export const useDeleteGuardian = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteGuardian(schoolId, id),
    onSuccess: () => {
      toast.success("Guardian deleted");
      qc.invalidateQueries({ queryKey: guardianKeys.list(schoolId) });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to delete guardian")),
  });
};
