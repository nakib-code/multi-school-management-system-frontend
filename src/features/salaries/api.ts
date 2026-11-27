import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  CreateSalaryPaymentInput,
  CreateTeacherSalaryInput,
  TeacherSalaryRecord,
} from "./types";

export const getTeacherSalaries = async (
  schoolId: number,
  params?: {
    teacherId?: number;
    month?: number;
    year?: number;
    status?: string;
  },
): Promise<TeacherSalaryRecord[]> => {
  const res = await api.get<ApiResponse<TeacherSalaryRecord[]>>(
    `/schools/${schoolId}/teacher-salaries`,
    { params },
  );
  return res.data.data;
};

export const createTeacherSalary = async (
  schoolId: number,
  payload: CreateTeacherSalaryInput,
): Promise<TeacherSalaryRecord> => {
  const res = await api.post<ApiResponse<TeacherSalaryRecord>>(
    `/schools/${schoolId}/teacher-salaries`,
    payload,
  );
  return res.data.data;
};

export const createSalaryPayment = async (
  schoolId: number,
  payload: CreateSalaryPaymentInput,
) => {
  const res = await api.post<ApiResponse<unknown>>(
    `/schools/${schoolId}/salary-payments`,
    payload,
  );
  return res.data.data;
};
