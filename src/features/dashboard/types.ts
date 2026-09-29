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

export interface SchoolDashboard {
role: "ADMIN" | "MANAGER";
stats: SchoolDashboardStats;
}

export type DashboardResponse =
| SuperAdminDashboard
| SchoolDashboard;
