import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  BulkCreateStudentFeeInput,
  BulkCreateStudentFeeResult,
  CreateStudentFeeInput,
  StudentFeeRecord,
  StudentPaymentRecord,
  SubmitStudentPaymentInput,
} from "./types";

export const getStudentFees = async (
  schoolId: number,
  params?: {
    studentId?: number;
    classId?: number;
    sectionId?: number;
    academicYear?: string;
    billingMonth?: string;
    examId?: number;
    status?: string;
    feeType?: string;
  },
): Promise<StudentFeeRecord[]> => {
  const res = await api.get<ApiResponse<StudentFeeRecord[]>>(
    `/schools/${schoolId}/student-fees`,
    { params },
  );
  return res.data.data;
};

export const createStudentFee = async (
  schoolId: number,
  payload: CreateStudentFeeInput,
): Promise<StudentFeeRecord> => {
  const res = await api.post<ApiResponse<StudentFeeRecord>>(
    `/schools/${schoolId}/student-fees`,
    payload,
  );
  return res.data.data;
};

export const bulkCreateStudentFees = async (
  schoolId: number,
  payload: BulkCreateStudentFeeInput,
): Promise<BulkCreateStudentFeeResult> => {
  const res = await api.post<ApiResponse<BulkCreateStudentFeeResult>>(
    `/schools/${schoolId}/student-fees/bulk`,
    payload,
  );
  return res.data.data;
};

export const deleteStudentFee = async (schoolId: number, id: number) => {
  const res = await api.delete<ApiResponse<StudentFeeRecord>>(
    `/schools/${schoolId}/student-fees/${id}`,
  );
  return res.data.data;
};

export const getStudentPayments = async (
  schoolId: number,
  params?: { studentId?: number; feeId?: number; status?: string },
): Promise<StudentPaymentRecord[]> => {
  const res = await api.get<ApiResponse<StudentPaymentRecord[]>>(
    `/schools/${schoolId}/student-payments`,
    { params },
  );
  return res.data.data;
};

export const submitStudentPayment = async (
  schoolId: number,
  payload: SubmitStudentPaymentInput,
): Promise<StudentPaymentRecord> => {
  const res = await api.post<ApiResponse<StudentPaymentRecord>>(
    `/schools/${schoolId}/student-payments`,
    payload,
  );
  return res.data.data;
};

export const verifyStudentPayment = async (schoolId: number, id: number) => {
  const res = await api.patch<ApiResponse<unknown>>(
    `/schools/${schoolId}/student-payments/${id}/verify`,
  );
  return res.data.data;
};

export const rejectStudentPayment = async (
  schoolId: number,
  id: number,
  rejectionReason: string,
) => {
  const res = await api.patch<ApiResponse<StudentPaymentRecord>>(
    `/schools/${schoolId}/student-payments/${id}/reject`,
    { rejectionReason },
  );
  return res.data.data;
};
