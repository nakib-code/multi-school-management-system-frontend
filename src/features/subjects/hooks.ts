"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import {
  createSubject,
  deleteSubject,
  getSubjects,
  toggleSubjectStatus,
} from "./api";
import type { CreateSubjectInput } from "./types";

export const subjectKeys = {
  all: ["subjects"] as const,
  list: (schoolId: number) => [...subjectKeys.all, schoolId] as const,
};

export const useSubjects = (schoolId: number) =>
  useQuery({
    queryKey: subjectKeys.list(schoolId),
    queryFn: () => getSubjects(schoolId),
    enabled: schoolId > 0,
  });

export const useCreateSubject = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubjectInput) =>
      createSubject(schoolId, payload),
    onSuccess: () => {
      toast.success("Subject created");
      qc.invalidateQueries({ queryKey: subjectKeys.list(schoolId) });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to create subject")),
  });
};

export const useToggleSubjectStatus = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => toggleSubjectStatus(schoolId, id),
    onSuccess: () => {
      toast.success("Subject status updated");
      qc.invalidateQueries({ queryKey: subjectKeys.list(schoolId) });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to update subject")),
  });
};

export const useDeleteSubject = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSubject(schoolId, id),
    onSuccess: () => {
      toast.success("Subject deleted");
      qc.invalidateQueries({ queryKey: subjectKeys.list(schoolId) });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to delete subject")),
  });
};

export const useUpdateSubject = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: { name?: string; code?: string; description?: string };
    }) => {
      const { api } = await import("@/lib/api");
      const res = await api.patch(
        `/schools/${schoolId}/subjects/${id}`,
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Subject updated successfully");
      qc.invalidateQueries({ queryKey: subjectKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to update subject")),
  });
};
