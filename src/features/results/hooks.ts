"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import { createResult, deleteResult, getResults } from "./api";
import type { CreateResultInput } from "./types";

export const resultKeys = {
  all: ["results"] as const,
  list: (schoolId: number, params?: Record<string, unknown>) =>
    [...resultKeys.all, schoolId, params] as const,
};

export const useResults = (
  schoolId: number,
  params?: { studentId?: number; examId?: number; subjectId?: number },
) =>
  useQuery({
    queryKey: resultKeys.list(schoolId, params),
    queryFn: () => getResults(schoolId, params),
    enabled: schoolId > 0,
  });

export const useCreateResult = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateResultInput) => createResult(schoolId, payload),
    onSuccess: () => {
      toast.success("Result recorded with auto-computed GPA");
      qc.invalidateQueries({ queryKey: resultKeys.all });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to record result")),
  });
};

export const useDeleteResult = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteResult(schoolId, id),
    onSuccess: () => {
      toast.success("Result deleted");
      qc.invalidateQueries({ queryKey: resultKeys.all });
    },
    onError: (err) => toast.error(getApiErrorMessage(err, "Failed to delete result")),
  });
};
