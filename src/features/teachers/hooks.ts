"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import {
  createTeacher,
  createTeacherAssignment,
  deactivateTeacher,
  deleteTeacherAssignment,
  getTeacherAssignments,
  getTeachers,
  resendTeacherOtp,
  resetTeacherPassword,
  verifyTeacherEmail,
} from "./api";
import type {
  CreateTeacherAssignmentInput,
  CreateTeacherInput,
  ResetTeacherPasswordInput,
} from "./types";

export const teacherKeys = {
  all: ["teachers"] as const,
  list: (schoolId: number, search?: string) =>
    [...teacherKeys.all, schoolId, search] as const,
  assignments: (schoolId: number) => ["teacher-assignments", schoolId] as const,
};

export const useTeachers = (schoolId: number, search?: string) =>
  useQuery({
    queryKey: teacherKeys.list(schoolId, search),
    queryFn: () => getTeachers(schoolId, search),
    enabled: schoolId > 0,
  });

export const useCreateTeacher = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTeacherInput) =>
      createTeacher(schoolId, payload),
    onSuccess: () => {
      toast.success("Teacher created! Verification code emailed to teacher.");
      qc.invalidateQueries({ queryKey: teacherKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to create teacher")),
  });
};

export const useVerifyTeacherEmail = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teacherId, code }: { teacherId: number; code: string }) =>
      verifyTeacherEmail(schoolId, teacherId, code),
    onSuccess: () => {
      toast.success("Teacher email verified & activated");
      qc.invalidateQueries({ queryKey: teacherKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Verification failed")),
  });
};

export const useResendTeacherOtp = (schoolId: number) => {
  return useMutation({
    mutationFn: (teacherId: number) => resendTeacherOtp(schoolId, teacherId),
    onSuccess: (data) => {
      toast.success(`New verification OTP emailed to ${data.email}`);
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to resend OTP")),
  });
};

export const useResetTeacherPassword = (schoolId: number) => {
  return useMutation({
    mutationFn: ({
      teacherId,
      payload,
    }: {
      teacherId: number;
      payload: ResetTeacherPasswordInput;
    }) => resetTeacherPassword(schoolId, teacherId, payload),
    onSuccess: () => {
      toast.success("Teacher password updated successfully");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to reset password")),
  });
};

export const useDeactivateTeacher = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (teacherId: number) => deactivateTeacher(schoolId, teacherId),
    onSuccess: () => {
      toast.success("Teacher deactivated");
      qc.invalidateQueries({ queryKey: teacherKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to deactivate teacher")),
  });
};

export const useTeacherAssignments = (schoolId: number) =>
  useQuery({
    queryKey: teacherKeys.assignments(schoolId),
    queryFn: () => getTeacherAssignments(schoolId),
    enabled: schoolId > 0,
  });

export const useCreateTeacherAssignment = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTeacherAssignmentInput) =>
      createTeacherAssignment(schoolId, payload),
    onSuccess: () => {
      toast.success("Teacher assigned to class/subject");
      qc.invalidateQueries({ queryKey: teacherKeys.assignments(schoolId) });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to assign teacher")),
  });
};

export const useDeleteTeacherAssignment = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTeacherAssignment(schoolId, id),
    onSuccess: () => {
      toast.success("Assignment removed");
      qc.invalidateQueries({ queryKey: teacherKeys.assignments(schoolId) });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to remove assignment")),
  });
};

export const useUpdateTeacher = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      teacherId,
      payload,
    }: {
      teacherId: number;
      payload: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        designation?: string;
        department?: string;
        qualification?: string;
        isActive?: boolean;
      };
    }) => {
      const { api } = await import("@/lib/api");
      const res = await api.patch(
        `/schools/${schoolId}/teachers/${teacherId}`,
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Teacher updated successfully");
      qc.invalidateQueries({ queryKey: teacherKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to update teacher")),
  });
};

export const useUpdateTeacherAssignment = (schoolId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: {
        classId?: number;
        sectionId?: number | null;
        subjectId?: number | null;
        academicYear?: string;
        isClassTeacher?: boolean;
      };
    }) => {
      const { api } = await import("@/lib/api");
      const res = await api.patch(
        `/schools/${schoolId}/teacher-assignments/${id}`,
        payload,
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Teacher assignment updated");
      qc.invalidateQueries({ queryKey: teacherKeys.all });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Failed to update assignment")),
  });
};
