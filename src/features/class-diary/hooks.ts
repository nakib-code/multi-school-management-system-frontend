"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import {
  createClassDiary,
  deleteClassDiary,
  getClassDiaries,
  updateClassDiary,
} from "./api";
import type {
  ClassDiaryFilterParams,
  CreateClassDiaryInput,
  UpdateClassDiaryInput,
} from "./types";

export const classDiaryKeys = {
  all: ["class-diaries"] as const,
  list: (schoolId: number, params?: ClassDiaryFilterParams) =>
    [...classDiaryKeys.all, schoolId, params] as const,
};

export const useClassDiaries = (
  schoolId: number,
  params?: ClassDiaryFilterParams,
) =>
  useQuery({
    queryKey: classDiaryKeys.list(schoolId, params),
    queryFn: () => getClassDiaries(schoolId, params),
    enabled: schoolId > 0,
  });

export const useCreateClassDiary = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClassDiaryInput) =>
      createClassDiary(schoolId, payload),
    onSuccess: (data) => {
      const notified = data.notifiedCount ?? 0;
      toast.success(
        notified > 0
          ? `Diary posted & ${notified} guardian/student alert(s) sent`
          : "Daily diary posted successfully",
      );
      qc.invalidateQueries({ queryKey: classDiaryKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to post daily diary")),
  });
};

export const useUpdateClassDiary = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateClassDiaryInput;
    }) => updateClassDiary(schoolId, id, payload),
    onSuccess: () => {
      toast.success("Daily diary updated");
      qc.invalidateQueries({ queryKey: classDiaryKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to update daily diary")),
  });
};

export const useDeleteClassDiary = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteClassDiary(schoolId, id),
    onSuccess: () => {
      toast.success("Daily diary deleted");
      qc.invalidateQueries({ queryKey: classDiaryKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to delete daily diary")),
  });
};
