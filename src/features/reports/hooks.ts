import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

import { getReportOverview } from "./api";

export interface SchoolReportOverview {
  fees: {
    totalBilled: number;
    totalCollected: number;
    totalDue: number;
    paidCount: number;
    partialCount: number;
    unpaidCount: number;
    pendingVerifications: number;
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
  };
}

export const reportKeys = {
  all: ["reports"] as const,
  overview: () => [...reportKeys.all, "overview"] as const,
  schoolOverview: (schoolId: number) =>
    [...reportKeys.all, "school", schoolId, "overview"] as const,
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
