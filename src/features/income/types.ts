import type { PrintableSchoolHeader } from "@/components/shared/printable-report-sheet";
import type { StudentPaymentMethod } from "@/features/fees/types";

export type UnifiedIncomeCategory =
  | "MONTHLY_FEE"
  | "ADMISSION_FEE"
  | "OTHER_STUDENT_FEE"
  | "OTHER_INCOME";

export type IncomeCategoryFilter = "ALL" | UnifiedIncomeCategory;

export type IncomeSourceType =
  | "STUDENT_PAYMENT"
  | "ADMISSION_PAYMENT"
  | "MANUAL_INCOME";

export interface IncomeCategoryBreakdown {
  category: UnifiedIncomeCategory;
  label: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface UnifiedIncomeRow {
  serial: number;
  id: string;
  entryId: number;
  date: string; // YYYY-MM-DD
  billingMonth: string; // YYYY-MM
  category: UnifiedIncomeCategory;
  categoryLabel: string;
  sourceType: IncomeSourceType;
  sourceOrStudent: string;
  sourceLabel: string | null;
  title: string;
  paymentMethod: string;
  referenceNo: string | null;
  notes: string | null;
  amount: number;
  recordedBy: string | null;
}

export interface IncomeDailyPoint {
  date: string; // YYYY-MM-DD
  day: number;
  totalAmount: number;
  count: number;
}

export interface IncomeSummaryResponse {
  billingMonth: string;
  category: IncomeCategoryFilter;
  startDate: string | null;
  endDate: string | null;
  monthlyFeeTotal: number;
  admissionFeeTotal: number;
  otherStudentFeeTotal: number;
  otherIncomeTotal: number;
  grandTotal: number;
  filteredTotal: number;
  entryCount: number;
  byCategory: IncomeCategoryBreakdown[];
  rows: UnifiedIncomeRow[];
}

export interface IncomeMonthlyChartResponse {
  school: PrintableSchoolHeader & { id: number };
  billingMonth: string;
  category: IncomeCategoryFilter;
  monthlyFeeTotal: number;
  admissionFeeTotal: number;
  otherStudentFeeTotal: number;
  otherIncomeTotal: number;
  grandTotal: number;
  displayedTotal: number;
  entryCount: number;
  activeDaysCount: number;
  byCategory: IncomeCategoryBreakdown[];
  dailySeries: IncomeDailyPoint[];
  rows: UnifiedIncomeRow[];
}

export interface CreateOtherIncomeInput {
  sourceLabel: string;
  title: string;
  amount: number;
  incomeDate?: string;
  paymentMethod: StudentPaymentMethod;
  referenceNo?: string | null;
  notes?: string | null;
}

export interface UpdateOtherIncomeInput {
  sourceLabel?: string;
  title?: string;
  amount?: number;
  incomeDate?: string;
  paymentMethod?: StudentPaymentMethod;
  referenceNo?: string | null;
  notes?: string | null;
}
