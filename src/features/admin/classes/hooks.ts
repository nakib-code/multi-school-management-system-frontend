import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createClass,
  createSection,
  deleteClass,
  deleteSection,
  getActiveClasses,
  getActiveSections,
  getClassById,
  getClasses,
  getClassFeeStructures,
  getSectionById,
  getSections,
  toggleClassStatus,
  toggleSectionStatus,
  updateClass,
  updateSection,
  upsertClassFeeStructures,
} from "./api";

import type {
  CreateClassPayload,
  CreateSectionPayload,
  UpdateClassPayload,
  UpdateSectionPayload,
  UpsertClassFeeStructuresPayload,
} from "./types";

// ==================================================
// Query Keys
// ==================================================

export const classKeys = {
  all: (schoolId: number) => ["admin", "classes", schoolId] as const,

  active: (schoolId: number) =>
    ["admin", "classes", schoolId, "active"] as const,

  detail: (schoolId: number, classId: number) =>
    ["admin", "classes", schoolId, classId] as const,

  feeStructures: (schoolId: number, params?: Record<string, unknown>) =>
    ["admin", "classes", schoolId, "fee-structures", params ?? "all"] as const,
};

export const sectionKeys = {
  root: (schoolId: number) => ["admin", "sections", schoolId] as const,

  all: (schoolId: number, classId?: number) =>
    ["admin", "sections", schoolId, classId ?? "all"] as const,

  active: (schoolId: number, classId?: number) =>
    ["admin", "sections", schoolId, classId ?? "all", "active"] as const,

  detail: (schoolId: number, sectionId: number) =>
    ["admin", "sections", schoolId, sectionId] as const,
};

// ==================================================
// Class Queries
// ==================================================

export const useClasses = (schoolId: number) => {
  return useQuery({
    queryKey: classKeys.all(schoolId),
    queryFn: () => getClasses(schoolId),
    enabled: !!schoolId,
  });
};

export const useActiveClasses = (schoolId: number) => {
  return useQuery({
    queryKey: classKeys.active(schoolId),
    queryFn: () => getActiveClasses(schoolId),
    enabled: !!schoolId,
  });
};

export const useClass = (schoolId: number, classId: number) => {
  return useQuery({
    queryKey: classKeys.detail(schoolId, classId),
    queryFn: () => getClassById(schoolId, classId),
    enabled: !!schoolId && !!classId,
  });
};

export const useClassFeeStructures = (
  schoolId: number,
  params?: { classId?: number; academicYear?: string; feeType?: string },
) => {
  return useQuery({
    queryKey: classKeys.feeStructures(schoolId, params),
    queryFn: () => getClassFeeStructures(schoolId, params),
    enabled: schoolId > 0,
  });
};

export const useUpsertClassFeeStructures = (schoolId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      classId,
      payload,
    }: {
      classId: number;
      payload: UpsertClassFeeStructuresPayload;
    }) => upsertClassFeeStructures(schoolId, classId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "classes", schoolId, "fee-structures"],
      });
      queryClient.invalidateQueries({
        queryKey: classKeys.active(schoolId),
      });
    },
  });
};

// ==================================================
// Class Mutations
// ==================================================

export const useCreateClass = (schoolId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClassPayload) => createClass(schoolId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: classKeys.all(schoolId),
      });

      queryClient.invalidateQueries({
        queryKey: classKeys.active(schoolId),
      });
    },
  });
};

export const useUpdateClass = (schoolId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      classId,
      payload,
    }: {
      classId: number;
      payload: UpdateClassPayload;
    }) => updateClass(schoolId, classId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: classKeys.all(schoolId),
      });

      queryClient.invalidateQueries({
        queryKey: classKeys.active(schoolId),
      });

      queryClient.invalidateQueries({
        queryKey: classKeys.detail(schoolId, variables.classId),
      });
    },
  });
};

export const useToggleClassStatus = (schoolId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId: number) => toggleClassStatus(schoolId, classId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: classKeys.all(schoolId),
      });

      queryClient.invalidateQueries({
        queryKey: classKeys.active(schoolId),
      });
    },
  });
};

export const useDeleteClass = (schoolId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classId: number) => deleteClass(schoolId, classId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: classKeys.all(schoolId),
      });

      queryClient.invalidateQueries({
        queryKey: classKeys.active(schoolId),
      });

      queryClient.invalidateQueries({
        queryKey: sectionKeys.root(schoolId),
      });
    },
  });
};

// ==================================================
// Section Queries
// ==================================================

export const useSections = (schoolId: number, classId?: number) => {
  return useQuery({
    queryKey: sectionKeys.all(schoolId, classId),

    queryFn: () => getSections(schoolId, classId),

    enabled: !!schoolId,
  });
};

export const useActiveSections = (schoolId: number, classId?: number) => {
  return useQuery({
    queryKey: sectionKeys.active(schoolId, classId),

    queryFn: () => getActiveSections(schoolId, classId),

    enabled: !!schoolId,
  });
};

export const useSection = (schoolId: number, sectionId: number) => {
  return useQuery({
    queryKey: sectionKeys.detail(schoolId, sectionId),

    queryFn: () => getSectionById(schoolId, sectionId),

    enabled: !!schoolId && !!sectionId,
  });
};

// ==================================================
// Section Mutations
// ==================================================

export const useCreateSection = (schoolId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSectionPayload) =>
      createSection(schoolId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: sectionKeys.root(schoolId),
      });

      queryClient.invalidateQueries({
        queryKey: sectionKeys.active(schoolId),
      });

      queryClient.invalidateQueries({
        queryKey: classKeys.detail(schoolId, variables.classId),
      });

      queryClient.invalidateQueries({
        queryKey: classKeys.all(schoolId),
      });
    },
  });
};

export const useUpdateSection = (schoolId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sectionId,
      payload,
    }: {
      sectionId: number;
      payload: UpdateSectionPayload;
    }) => updateSection(schoolId, sectionId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sectionKeys.root(schoolId),
      });

      queryClient.invalidateQueries({
        queryKey: sectionKeys.active(schoolId),
      });
    },
  });
};

export const useToggleSectionStatus = (schoolId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sectionId: number) => toggleSectionStatus(schoolId, sectionId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sectionKeys.root(schoolId),
      });

      queryClient.invalidateQueries({
        queryKey: sectionKeys.active(schoolId),
      });
    },
  });
};

export const useDeleteSection = (schoolId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sectionId: number) => deleteSection(schoolId, sectionId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sectionKeys.root(schoolId),
      });

      queryClient.invalidateQueries({
        queryKey: sectionKeys.active(schoolId),
      });

      queryClient.invalidateQueries({
        queryKey: classKeys.all(schoolId),
      });
    },
  });
};
