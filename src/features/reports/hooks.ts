import { useQuery } from "@tanstack/react-query";
import type { FeeType } from "@/features/fees/types";
import { api } from "@/lib/api";

import { getReportOverview } from "./api";

export interface FeeTypeSummaryBucket {
  feeType: FeeType;
  count: number;
  billed: number;
  collected: number;
  due: number;
  waived: number;
}

export interface SchoolReportOverview {
  fees: {
    totalBilled: number;
    totalCollected: number;
    totalDue: number;
    totalWaived?: number;
    paidCount: number;
    partialCount: number;
    unpaidCount: number;
    pendingVerifications: number;
    byFeeType?: FeeTypeSummaryBucket[];
  };
  payroll: {
    totalRecords: number;
    totalGross: number;
    totalPaid: number;
    totalPending: number;
    paidCount: number;
    unpaidCount: number;
  };
  academics: {
    activeStudents: number;
    activeTeachers: number;
    activeClasses: number;
    totalExams: number;
    totalResults: number;
    totalAttendance30d: number;
    presentAttendance30d: number;
    attendanceRate30d: number;
  };
  admissions: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalExpected?: number;
    collectedVerified?: number;
    pendingPayment?: number;
    unlinkedCollected?: number;
  };
}

export interface ChartSchoolHeader {
  id: number;
  name: string;
  code: string;
  logo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export interface AdmissionChartReport {
  school: ChartSchoolHeader | null;
  filters: Record<string, unknown>;
  rows: Array<{
    serial: number;
    id: number;
    applicationNo: string;
    studentName: string;
    nameBangla: string | null;
    guardianName: string | null;
    guardianPhone: string | null;
    classId: number;
    className: string;
    sectionName: string | null;
    academicYear: string;
    admissionFee: number;
    paymentMethod: string | null;
    trxId: string | null;
    senderNumber: string | null;
    paymentStatus: string;
    admissionStatus: string;
    createdAt: string;
  }>;
  summary: {
    totalApplicants: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    totalExpected: number;
    totalCollected: number;
    totalPending: number;
    paidCount: number;
    unpaidCount: number;
  };
}

export interface FeeChartReport {
  school: ChartSchoolHeader | null;
  filters: Record<string, unknown>;
  rows: Array<{
    serial: number;
    id: number;
    studentId: number;
    studentCode: string;
    rollNumber: number | null;
    studentName: string;
    className: string;
    sectionName: string | null;
    academicYear: string;
    feeType: FeeType;
    title: string;
    billingMonth: string | null;
    examName: string | null;
    billed: number;
    paid: number;
    due: number;
    status: string;
    dueDate: string;
  }>;
  summary: {
    totalInvoices: number;
    totalBilled: number;
    totalCollected: number;
    totalDue: number;
    totalWaived: number;
    paidCount: number;
    partialCount: number;
    pendingCount: number;
    waivedCount: number;
    byFeeType: FeeTypeSummaryBucket[];
  };
}

export interface RosterChartReport {
  school: ChartSchoolHeader | null;
  filters: Record<string, unknown>;
  rows: Array<{
    serial: number;
    enrollmentId: number;
    studentRecordId: number;
    studentId: string;
    rollNumber: number | null;
    studentName: string;
    nameBangla: string | null;
    gender: string | null;
    residentialType: string;
    className: string;
    sectionName: string | null;
    academicYear: string;
    guardianName: string | null;
    guardianPhone: string | null;
    status: string;
  }>;
  summary: {
    totalStudents: number;
    activeCount: number;
    completedCount: number;
    transferredCount?: number;
    droppedCount: number;
    residentialCount: number;
    nonResidentialCount: number;
    dayCareCount: number;
  };
}

export interface MonthlyNetReport {
  school: ChartSchoolHeader;
  billingMonth: string;
  trendMonths: number;
  summary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    status: "SURPLUS" | "DEFICIT";
    expenseSharePercent: number;
  };
  incomeBreakdown: {
    monthlyFeeTotal: number;
    admissionFeeTotal: number;
    otherStudentFeeTotal: number;
    otherIncomeTotal: number;
    byCategory: Array<{
      category:
        | "MONTHLY_FEE"
        | "ADMISSION_FEE"
        | "OTHER_STUDENT_FEE"
        | "OTHER_INCOME";
      label: string;
      amount: number;
      count: number;
      percentage: number;
    }>;
  };
  expenseBreakdown: Array<{
    sheetId: number;
    sheetName: string;
    totalAmount: number;
    entryCount: number;
    percentage: number;
  }>;
  dailySeries: Array<{
    date: string;
    day: number;
    income: number;
    expense: number;
    net: number;
  }>;
  trend: Array<{
    billingMonth: string;
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    status: "SURPLUS" | "DEFICIT";
  }>;
}

export const reportKeys = {
  all: ["reports"] as const,
  overview: () => [...reportKeys.all, "overview"] as const,
  schoolOverview: (schoolId: number) =>
    [...reportKeys.all, "school", schoolId, "overview"] as const,
  admissionChart: (schoolId: number, params?: Record<string, unknown>) =>
    [
      ...reportKeys.all,
      "school",
      schoolId,
      "charts",
      "admissions",
      params,
    ] as const,
  feeChart: (schoolId: number, params?: Record<string, unknown>) =>
    [...reportKeys.all, "school", schoolId, "charts", "fees", params] as const,
  rosterChart: (schoolId: number, params?: Record<string, unknown>) =>
    [
      ...reportKeys.all,
      "school",
      schoolId,
      "charts",
      "roster",
      params,
    ] as const,
  monthlyNet: (schoolId: number, params?: Record<string, unknown>) =>
    [...reportKeys.all, "school", schoolId, "monthly-net", params] as const,
};

export const useReportOverview = () => {
  return useQuery({
    queryKey: reportKeys.overview(),
    queryFn: getReportOverview,
  });
};

export const useSchoolReportOverview = (schoolId: number) => {
  return useQuery({
    queryKey: reportKeys.schoolOverview(schoolId),
    enabled: schoolId > 0,
    queryFn: async () => {
      const res = await api.get<{ data: SchoolReportOverview }>(
        `/schools/${schoolId}/reports/overview`,
      );
      return res.data.data;
    },
  });
};

export const useAdmissionChartReport = (
  schoolId: number,
  params?: {
    classId?: number;
    sectionId?: number;
    academicYear?: string;
    status?: string;
    paymentStatus?: string;
  },
  enabled = true,
) => {
  return useQuery({
    queryKey: reportKeys.admissionChart(schoolId, params),
    enabled: schoolId > 0 && enabled,
    queryFn: async () => {
      const res = await api.get<{ data: AdmissionChartReport }>(
        `/schools/${schoolId}/reports/charts/admissions`,
        { params },
      );
      return res.data.data;
    },
  });
};

export const useFeeChartReport = (
  schoolId: number,
  params?: {
    feeType?: "ALL" | FeeType;
    classId?: number;
    sectionId?: number;
    academicYear?: string;
    billingMonth?: string;
    examId?: number;
    status?: string;
  },
  enabled = true,
) => {
  return useQuery({
    queryKey: reportKeys.feeChart(schoolId, params),
    enabled: schoolId > 0 && enabled,
    queryFn: async () => {
      const res = await api.get<{ data: FeeChartReport }>(
        `/schools/${schoolId}/reports/charts/fees`,
        { params },
      );
      return res.data.data;
    },
  });
};

export const useStudentRosterChartReport = (
  schoolId: number,
  params?: {
    classId?: number;
    sectionId?: number;
    academicYear?: string;
    status?: string;
  },
  enabled = true,
) => {
  return useQuery({
    queryKey: reportKeys.rosterChart(schoolId, params),
    enabled: schoolId > 0 && enabled,
    queryFn: async () => {
      const res = await api.get<{ data: RosterChartReport }>(
        `/schools/${schoolId}/reports/charts/roster`,
        { params },
      );
      return res.data.data;
    },
  });
};

export const useMonthlyNetReport = (
  schoolId: number,
  params?: {
    billingMonth?: string;
    trendMonths?: number;
  },
  enabled = true,
) => {
  return useQuery({
    queryKey: reportKeys.monthlyNet(schoolId, params),
    enabled: schoolId > 0 && enabled,
    queryFn: async () => {
      const res = await api.get<{ data: MonthlyNetReport }>(
        `/schools/${schoolId}/reports/monthly-net`,
        { params },
      );
      return res.data.data;
    },
  });
};
