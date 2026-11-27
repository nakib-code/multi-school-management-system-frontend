import type { MobilePaymentMethod } from "@/features/payments/types";

export type StudentPaymentMethod = "CASH" | MobilePaymentMethod;

export type FeeType =
  | "ADMISSION"
  | "MONTHLY"
  | "EXAM"
  | "SESSION"
  | "TRANSPORT"
  | "LIBRARY"
  | "LAB"
  | "OTHER";

export const ALL_FEE_TYPES: Array<{ value: FeeType; label: string }> = [
  { value: "ADMISSION", label: "Admission Fee" },
  { value: "MONTHLY", label: "Monthly Tuition" },
  { value: "EXAM", label: "Exam Fee" },
  { value: "SESSION", label: "Session Fee" },
  { value: "TRANSPORT", label: "Transport Fee" },
  { value: "LIBRARY", label: "Library Fee" },
  { value: "LAB", label: "Lab Fee" },
  { value: "OTHER", label: "Other / Custom" },
];
export type FeeStatus = "PENDING" | "PARTIAL" | "PAID" | "WAIVED";
export type StudentPaymentStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface StudentPaymentRecord {
  id: number;
  schoolId: number;
  studentId: number;
  feeId: number;
  paymentMethod: StudentPaymentMethod;
  senderNumber: string;
  receiverNumber: string | null;
  trxId: string;
  paidAmount: number | string;
  status: StudentPaymentStatus;
  paidAt: string;
  verifiedAt?: string | null;
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
  academicYear?: string | null;
  billingMonth?: string | null;
  examId?: number | null;
  status: FeeStatus;
  description: string | null;
  student?: {
    id: number;
    firstName: string;
    lastName: string | null;
    studentId: string;
  };
  enrollment?: {
    id: number;
    academicYear: string;
    rollNumber: number | null;
    classId?: number;
    sectionId?: number | null;
    class?: { id: number; name: string; code: string };
    section?: { id: number; name: string } | null;
  };
  exam?: { id: number; name: string; type: string } | null;
  payments?: StudentPaymentRecord[];
}

export interface CreateStudentFeeInput {
  studentId: number;
  enrollmentId: number;
  feeType: FeeType;
  title: string;
  amount?: number;
  useClassDefaultAmount?: boolean;
  dueDate: string;
  academicYear?: string;
  billingMonth?: string;
  examId?: number;
  description?: string;
}

export interface BulkCreateStudentFeeInput {
  classId: number;
  sectionId?: number;
  academicYear?: string;
  feeType: FeeType;
  title: string;
  amount?: number;
  useClassDefaultAmount?: boolean;
  dueDate: string;
  billingMonth?: string;
  examId?: number;
  description?: string;
}

export interface BulkCreateStudentFeeResult {
  className: string;
  resolvedAmount?: number;
  createdCount: number;
  skippedCount: number;
}

export interface SubmitStudentPaymentInput {
  studentId: number;
  feeId: number;
  paymentMethod: StudentPaymentMethod;
  senderNumber?: string;
  receiverNumber?: string;
  trxId?: string;
  paidAmount: number;
  remarks?: string;
}
