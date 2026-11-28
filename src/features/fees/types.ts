import type { MobilePaymentMethod } from "@/features/payments/types";

export type StudentPaymentMethod =
  | "CASH"
  | MobilePaymentMethod
  | "BANK_TRANSFER"
  | "CHEQUE";

export type StudentConcessionType =
  | "ORPHAN"
  | "LILLAH"
  | "SIBLING"
  | "SCHOLARSHIP"
  | "CUSTOM";

export type DiscountMode = "PERCENTAGE" | "FIXED";

export const CONCESSION_TYPE_LABELS: Record<StudentConcessionType, string> = {
  ORPHAN: "এতিম (Orphan)",
  LILLAH: "লিল্লাহ বোর্ডিং (Lillah)",
  SIBLING: "ভাই-বোন ছাড় (Sibling)",
  SCHOLARSHIP: "বৃত্তি (Scholarship)",
  CUSTOM: "বিশেষ ছাড় (Custom)",
};

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
export type FeeStatus = "PENDING" | "PARTIAL" | "OVERDUE" | "PAID" | "WAIVED";
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
  receiptNo?: string | null;
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
  grossAmount?: number | string | null;
  concessionAmount?: number | string | null;
  concessionType?: StudentConcessionType | null;
  waivedAmount?: number | string | null;
  waiverReason?: string | null;
  waivedAt?: string | null;
  waivedBy?: { id: number; name: string; role: string } | null;
  dueDate: string;
  academicYear?: string | null;
  billingMonth?: string | null;
  examId?: number | null;
  status: FeeStatus;
  storedStatus?: FeeStatus;
  isOverdue?: boolean;
  computedPaid?: number;
  computedWaived?: number;
  computedDue?: number;
  description: string | null;
  student?: {
    id: number;
    firstName: string;
    lastName: string | null;
    studentId: string;
    concessionType?: StudentConcessionType | null;
    concessionMode?: DiscountMode | null;
    concessionValue?: number | string | null;
    concessionReason?: string | null;
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
  applyStudentConcession?: boolean;
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
  applyStudentConcession?: boolean;
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
  concessionAppliedCount?: number;
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
