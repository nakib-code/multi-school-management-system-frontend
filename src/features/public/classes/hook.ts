"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getPublicActiveClasses,
  getPublicActiveSections,
} from "./api";

export const publicClassKeys = {
  all: ["public-classes"] as const,

  active: (schoolId: number) =>
    [...publicClassKeys.all, "active", schoolId] as const,

  sections: (
    schoolId: number,
    classId?: number,
  ) =>
    [
      "public-sections",
      schoolId,
      classId,
    ] as const,
};

export const usePublicActiveClasses = (
  schoolId: number,
) => {
  return useQuery({
    queryKey: publicClassKeys.active(schoolId),
    queryFn: () =>
      getPublicActiveClasses(schoolId),
    enabled: schoolId > 0,
  });
};

export const usePublicActiveSections = (
  schoolId: number,
  classId?: number,
) => {
  return useQuery({
    queryKey: publicClassKeys.sections(
      schoolId,
      classId,
    ),
    queryFn: () =>
      getPublicActiveSections(
        schoolId,
        classId,
      ),
    enabled:
      schoolId > 0 &&
      classId !== undefined,
  });
};
