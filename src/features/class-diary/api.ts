import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  ClassDiaryFilterParams,
  ClassDiaryRecord,
  CreateClassDiaryInput,
  UpdateClassDiaryInput,
} from "./types";

export const getClassDiaries = async (
  schoolId: number,
  params?: ClassDiaryFilterParams,
): Promise<ClassDiaryRecord[]> => {
  const res = await api.get<ApiResponse<ClassDiaryRecord[]>>(
    `/schools/${schoolId}/class-diaries`,
    { params },
  );
  return res.data.data;
};

export const createClassDiary = async (
  schoolId: number,
  payload: CreateClassDiaryInput,
): Promise<ClassDiaryRecord> => {
  const res = await api.post<ApiResponse<ClassDiaryRecord>>(
    `/schools/${schoolId}/class-diaries`,
    payload,
  );
  return res.data.data;
};

export const updateClassDiary = async (
  schoolId: number,
  id: number,
  payload: UpdateClassDiaryInput,
): Promise<ClassDiaryRecord> => {
  const res = await api.patch<ApiResponse<ClassDiaryRecord>>(
    `/schools/${schoolId}/class-diaries/${id}`,
    payload,
  );
  return res.data.data;
};

export const deleteClassDiary = async (schoolId: number, id: number) => {
  const res = await api.delete<ApiResponse<ClassDiaryRecord>>(
    `/schools/${schoolId}/class-diaries/${id}`,
  );
  return res.data.data;
};
