import type { MobilePaymentMethod } from "@/features/payments/types";

export type FeeType =
  | "ADMISSION"
  | "MONTHLY"
  | "EXAM"
  | "TRANSPORT"
  | "LIBRARY"
  | "OTHER";
export type FeeStatus = "PENDING" | "PARTIAL" | "PAID" | "WAIVED";
export type StudentPaymentStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface StudentPaymentRecord {
  id: number;
  schoolId: number;
  studentId: number;
  feeId: number;
  paymentMethod: MobilePaymentMethod;
  senderNumber: string;
  receiverNumber: string | null;
  trxId: string;
  paidAmount: number | string;
  status: StudentPaymentStatus;
  paidAt: string;
  rejectionReason?: string | null;
  remarks?: string | null;
  student?: {
    id: number;
    firstName: string;
    lastName: string | null;
    studentId: string;
  };
  fee?: {
    id: number;
    title: string;
    feeType: FeeType;
    amount: number | string;
  };
}

export interface StudentFeeRecord {
  id: number;
  schoolId: number;
  studentId: number;
  enrollmentId: number;
  feeType: FeeType;
  title: string;
  amount: number | string;
  dueDate: string;
  status: FeeStatus;
  description: string | null;
  student?: {
    id: number;
    firstName: string;
    lastName: string | null;
    studentId: string;
  };
  payments?: StudentPaymentRecord[];
}

export interface CreateStudentFeeInput {
  studentId: number;
  enrollmentId: number;
  feeType: FeeType;
  title: string;
  amount: number;
  dueDate: string;
  description?: string;
}

export interface SubmitStudentPaymentInput {
  studentId: number;
  feeId: number;
  paymentMethod: MobilePaymentMethod;
  senderNumber: string;
  receiverNumber?: string;
  trxId: string;
  paidAmount: number;
  remarks?: string;
}
