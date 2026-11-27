"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import { createExam, deleteExam, getExams, updateExamStatus } from "./api";
import type { CreateExamInput, ExamStatus } from "./types";

export const examKeys = {
  all: ["exams"] as const,
  list: (schoolId: number, params?: Record<string, unknown>) =>
    [...examKeys.all, schoolId, params] as const,
};

export const useExams = (
  schoolId: number,
  params?: { classId?: number; status?: string; academicYear?: string },
) =>
  useQuery({
    queryKey: examKeys.list(schoolId, params),
    queryFn: () => getExams(schoolId, params),
    enabled: schoolId > 0,
  });

export const useCreateExam = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExamInput) => createExam(schoolId, payload),
    onSuccess: () => {
      toast.success("Exam created successfully");
      qc.invalidateQueries({ queryKey: examKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to create exam")),
  });
};

export const useUpdateExamStatus = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: ExamStatus }) =>
      updateExamStatus(schoolId, id, status),
    onSuccess: () => {
      toast.success("Exam status updated");
      qc.invalidateQueries({ queryKey: examKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to update exam")),
  });
};

export const useDeleteExam = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteExam(schoolId, id),
    onSuccess: () => {
      toast.success("Exam deleted");
      qc.invalidateQueries({ queryKey: examKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to delete exam")),
  });
};
