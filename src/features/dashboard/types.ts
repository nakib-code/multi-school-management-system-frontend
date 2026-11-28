export interface SuperAdminDashboardStats {
  totalSchools: number;
  pendingSchools: number;
  activeSchools: number;
  blockedSchools: number;
  rejectedSchools: number;
}

export interface SuperAdminDashboard {
  role: "SUPER_ADMIN";
  stats: SuperAdminDashboardStats;
}

export interface SchoolDashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalManagers: number;
  totalClasses: number;
  totalSections: number;
  totalSubjects: number;
}

export interface SchoolDashboardFinance {
  billingMonth: string;
  todayDate: string;
  monthlyIncome: number;
  monthlyCustomExpense: number;
  monthlyPayrollExpense: number;
  monthlyTotalExpense: number;
  monthlyNetBalance: number;
  monthlyStatus: "SURPLUS" | "DEFICIT";
  todayCashCollected: number;
  todayCashSpent: number;
  todayCashInHand: number;
  pendingPaymentVerifications: number;
  overdueFeesCount: number;
}

export interface SchoolDashboard {
  role: "ADMIN" | "MANAGER";
  stats: SchoolDashboardStats;
  finance?: SchoolDashboardFinance;
}

export type DashboardResponse = SuperAdminDashboard | SchoolDashboard;
