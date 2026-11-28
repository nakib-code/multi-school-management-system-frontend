import type { PrintableSchoolHeader } from "@/components/shared/printable-report-sheet";
import type { StudentPaymentMethod } from "@/features/fees/types";

export type CustomExpenseFieldType = "TEXT" | "NUMBER" | "DATE";

export interface CustomExpenseField {
  id: number;
  sheetId: number;
  schoolId: number;
  label: string;
  fieldKey: string;
  fieldType: CustomExpenseFieldType;
  isRequired: boolean;
  sortOrder: number;
}

export interface CustomExpenseSheet {
  id: number;
  schoolId: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  fields: CustomExpenseField[];
  billingMonth?: string;
  monthEntryCount?: number;
  monthTotalAmount?: number;
  _count?: {
    entries: number;
  };
}

export interface CustomExpenseFieldInput {
  id?: number;
  label: string;
  fieldKey?: string;
  fieldType: CustomExpenseFieldType;
  isRequired?: boolean;
  sortOrder?: number;
}

export interface CreateCustomExpenseSheetInput {
  name: string;
  description?: string | null;
  fields?: CustomExpenseFieldInput[];
}

export interface UpdateCustomExpenseSheetFieldsInput {
  name?: string;
  description?: string | null;
  fields: CustomExpenseFieldInput[];
}

export interface CustomExpenseEntry {
  id: number;
  sheetId: number;
  schoolId: number;
  entryDate: string; // YYYY-MM-DD
  billingMonth: string; // YYYY-MM
  amount: number;
  paymentMethod?: StudentPaymentMethod;
  voucherNo?: string | null;
  attachmentUrl?: string | null;
  fieldValues: Record<string, string | number | null>;
  recordedBy?: {
    id: number;
    name: string;
    role: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomExpenseChartRow extends CustomExpenseEntry {
  serial: number;
}

export interface CustomExpenseDailyPoint {
  date: string; // YYYY-MM-DD
  day: number;
  totalAmount: number;
  count: number;
}

export interface CustomExpenseMonthlyChart {
  school: PrintableSchoolHeader & { id: number };
  sheet: CustomExpenseSheet;
  billingMonth: string;
  startDate?: string | null;
  endDate?: string | null;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  hasActiveFilters?: boolean;
  unfilteredTotalAmount?: number;
  unfilteredEntryCount?: number;
  totalAmount: number;
  entryCount: number;
  activeDaysCount: number;
  numericColumnTotals?: Record<string, number>;
  dailySeries: CustomExpenseDailyPoint[];
  rows: CustomExpenseChartRow[];
}

export interface CreateCustomExpenseEntryInput {
  entryDate?: string;
  amount: number;
  paymentMethod?: StudentPaymentMethod;
  attachmentUrl?: string | null;
  fieldValues?: Record<string, string | number | null>;
}

export interface UpdateCustomExpenseEntryInput {
  entryDate?: string;
  amount?: number;
  paymentMethod?: StudentPaymentMethod;
  attachmentUrl?: string | null;
  fieldValues?: Record<string, string | number | null>;
}
