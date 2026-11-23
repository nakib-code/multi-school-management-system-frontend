"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, getApiErrorMessage } from "@/lib/api";
import type { ApiResponse } from "@/types/api";

export type UploadCategory =
  | "SCHOOL_LOGO"
  | "SCHOOL_PROFILE"
  | "USER_AVATAR"
  | "STUDENT_PHOTO"
  | "TEACHER_PHOTO"
  | "GUARDIAN_PHOTO"
  | "DOCUMENT";

export interface UploadedFileRecord {
  id: number;
  url: string;
  publicId: string;
  mimeType: string;
  bytes: number;
  category: UploadCategory;
  createdAt: string;
}

export const useUploadFile = () =>
  useMutation({
    mutationFn: async (payload: {
      dataUrl: string;
      category: UploadCategory;
      fileName?: string;
    }) => {
      const res = await api.post<ApiResponse<UploadedFileRecord>>("/uploads", payload);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("File uploaded successfully");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Upload failed"));
    },
  });

export const useDeleteUploadedFile = () =>
  useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/uploads/${id}`);
    },
    onSuccess: () => {
      toast.success("File removed");
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to delete file"));
    },
  });
