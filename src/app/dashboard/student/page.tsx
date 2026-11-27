"use client";

import {
  Award,
  BookOpenCheck,
  CalendarCheck,
  CreditCard,
  FileText,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { DashboardCard } from "@/components/layout/dashboard-card";
import { LoadingState } from "@/components/shared/loading";
import { useAttendances } from "@/features/attendance/hooks";
import { useStudentFees } from "@/features/fees/hooks";
import { useResults } from "@/features/results/hooks";
import { useMyStudentProfile } from "@/features/students/hooks";
import { useAuth } from "@/providers/auth-provider";

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;

  const profileQuery = useMyStudentProfile(schoolId);
  const attendanceQuery = useAttendances(schoolId);
  const resultsQuery = useResults(schoolId);
  const feesQuery = useStudentFees(schoolId);

  if (profileQuery.isLoading) {
    return <LoadingState message="Loading student portal..." />;
  }

  const profile = profileQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome,{" "}
          {profile
            ? `${profile.firstName} ${profile.lastName ?? ""}`
            : user?.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {profile
            ? `Student ID: ${profile.studentId}`
            : "View your attendance, exams, results, fees, and Hefz progress."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard
          title="Attendance Logs"
          value={attendanceQuery.data?.length ?? 0}
          icon={CalendarCheck}
        />
        <DashboardCard
          title="Published Results"
          value={resultsQuery.data?.length ?? 0}
          icon={Award}
        />
        <DashboardCard
          title="Fee Invoices"
          value={feesQuery.data?.length ?? 0}
          icon={CreditCard}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            label: "My Profile",
            href: "/dashboard/student/profile",
            icon: UserCheck,
          },
          {
            label: "Attendance History",
            href: "/dashboard/student/attendance",
            icon: CalendarCheck,
          },
          {
            label: "Exam Schedules",
            href: "/dashboard/student/exams",
            icon: FileText,
          },
          {
            label: "Results & GPA",
            href: "/dashboard/student/results",
            icon: Award,
          },
          {
            label: "Fees & Payments",
            href: "/dashboard/student/fees",
            icon: CreditCard,
          },
          {
            label: "Hefz Progress",
            href: "/dashboard/student/hefz",
            icon: BookOpenCheck,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 text-sm font-medium transition hover:border-primary/40 hover:bg-muted/30"
            >
              <Icon className="h-5 w-5 text-primary" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
