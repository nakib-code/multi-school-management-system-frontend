import { api } from "@/lib/api";

export interface PublicClass {
  id: number;
  name: string;
  code: string;
  description: string | null;
}

export interface PublicSection {
  id: number;
  classId: number;
  name: string;
  code: string;
  capacity: number | null;
  roomNumber: string | null;
}

export const getPublicActiveClasses = async (
  schoolId: number,
): Promise<PublicClass[]> => {
  const response = await api.get(
    `/public/schools/${schoolId}/classes/active`,
  );

  return response.data.data;
};

export const getPublicActiveSections = async (
  schoolId: number,
  classId?: number,
): Promise<PublicSection[]> => {
  const response = await api.get(
    `/public/schools/${schoolId}/sections/active`,
    {
      params:
        classId !== undefined
          ? { classId }
          : undefined,
    },
  );

  return response.data.data;
};
