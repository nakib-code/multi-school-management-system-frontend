
import { api } from "@/lib/api";
import type {
  CreateClassPayload,
  CreateSectionPayload,
  SchoolClass,
  SchoolSection,
  UpdateClassPayload,
  UpdateSectionPayload,
} from "./types";

// ==================================================
// Classes
// ==================================================

export const getClasses = async (
  schoolId: number,
): Promise<SchoolClass[]> => {
  const response = await api.get(
    `/schools/${schoolId}/classes`,
  );

  return response.data.data;
};

export const getActiveClasses = async (
  schoolId: number,
): Promise<SchoolClass[]> => {
  const response = await api.get(
    `/schools/${schoolId}/classes/active`,
  );

  return response.data.data;
};

export const getClassById = async (
  schoolId: number,
  classId: number,
): Promise<SchoolClass> => {
  const response = await api.get(
    `/schools/${schoolId}/classes/${classId}`,
  );

  return response.data.data;
};

export const createClass = async (
  schoolId: number,
  payload: CreateClassPayload,
): Promise<SchoolClass> => {
  const response = await api.post(
    `/schools/${schoolId}/classes`,
    payload,
  );

  return response.data.data;
};

export const updateClass = async (
  schoolId: number,
  classId: number,
  payload: UpdateClassPayload,
): Promise<SchoolClass> => {
  const response = await api.patch(
    `/schools/${schoolId}/classes/${classId}`,
    payload,
  );

  return response.data.data;
};

export const toggleClassStatus = async (
  schoolId: number,
  classId: number,
): Promise<SchoolClass> => {
  const response = await api.patch(
    `/schools/${schoolId}/classes/${classId}/toggle-status`,
  );

  return response.data.data;
};

export const deleteClass = async (
  schoolId: number,
  classId: number,
) => {
  const response = await api.delete(
    `/schools/${schoolId}/classes/${classId}`,
  );

  return response.data.data;
};

// ==================================================
// Sections
// ==================================================

export const getSections = async (
  schoolId: number,
  classId?: number,
): Promise<SchoolSection[]> => {
  const response = await api.get(
    `/schools/${schoolId}/sections`,
    {
      params:
        classId !== undefined
          ? { classId }
          : undefined,
    },
  );

  return response.data.data;
};

export const getActiveSections = async (
  schoolId: number,
  classId?: number,
): Promise<SchoolSection[]> => {
  const response = await api.get(
    `/schools/${schoolId}/sections/active`,
    {
      params:
        classId !== undefined
          ? { classId }
          : undefined,
    },
  );

  return response.data.data;
};

export const getSectionById = async (
  schoolId: number,
  sectionId: number,
): Promise<SchoolSection> => {
  const response = await api.get(
    `/schools/${schoolId}/sections/${sectionId}`,
  );

  return response.data.data;
};

export const createSection = async (
  schoolId: number,
  payload: CreateSectionPayload,
): Promise<SchoolSection> => {
  const response = await api.post(
    `/schools/${schoolId}/sections`,
    payload,
  );

  return response.data.data;
};

export const updateSection = async (
  schoolId: number,
  sectionId: number,
  payload: UpdateSectionPayload,
): Promise<SchoolSection> => {
  const response = await api.patch(
    `/schools/${schoolId}/sections/${sectionId}`,
    payload,
  );

  return response.data.data;
};

export const toggleSectionStatus = async (
  schoolId: number,
  sectionId: number,
): Promise<SchoolSection> => {
  const response = await api.patch(
    `/schools/${schoolId}/sections/${sectionId}/toggle-status`,
  );

  return response.data.data;
};

export const deleteSection = async (
  schoolId: number,
  sectionId: number,
) => {
  const response = await api.delete(
    `/schools/${schoolId}/sections/${sectionId}`,
  );

  return response.data.data;
};
