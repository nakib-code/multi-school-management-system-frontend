"use client";

import {
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  GraduationCap,
  Layers,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { DashboardCard } from "@/components/layout/dashboard-card";
import { DashboardFinanceSection } from "@/components/layout/dashboard-finance-section";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { useDashboard } from "@/features/dashboard/hooks";
import { getApiErrorMessage } from "@/lib/api";

export default function ManagerDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDashboard();

  if (isLoading) return <LoadingState message="Loading manager dashboard..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load dashboard")}
        onRetry={() => refetch()}
      />
    );
  }

  const stats =
    data && "totalStudents" in data.stats
      ? data.stats
      : {
          totalStudents: 0,
          totalTeachers: 0,
          totalManagers: 0,
          totalClasses: 0,
          totalSections: 0,
          totalSubjects: 0,
        };

  const finance = data && "finance" in data ? data.finance : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manager Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage daily admissions, academics, attendance, exams, fees, accounts,
          and Hefz operations.
        </p>
      </div>

      <DashboardFinanceSection userRole="MANAGER" finance={finance} />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
        <DashboardCard
          title="Students"
          value={stats.totalStudents}
          icon={GraduationCap}
        />
        <DashboardCard
          title="Teachers"
          value={stats.totalTeachers}
          icon={Users}
        />
        <DashboardCard
          title="Managers"
          value={stats.totalManagers}
          icon={ShieldCheck}
        />
        <DashboardCard
          title="Classes"
          value={stats.totalClasses}
          icon={BookOpen}
        />
        <DashboardCard
          title="Sections"
          value={stats.totalSections}
          icon={Layers}
        />
        <DashboardCard
          title="Subjects"
          value={stats.totalSubjects}
          icon={ClipboardList}
        />
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Review Admissions",
            href: "/dashboard/manager/admissions",
            icon: UserPlus,
          },
          {
            label: "Attendance & Leaves",
            href: "/dashboard/manager/attendance",
            icon: CalendarCheck,
          },
          {
            label: "Verify Student Fees",
            href: "/dashboard/manager/fees",
            icon: CreditCard,
          },
          {
            label: "Hefz & Najera Logs",
            href: "/dashboard/manager/hefz",
            icon: BookOpenCheck,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[52px] items-center gap-3 rounded-[11px] border bg-card px-3.5 py-3 text-sm font-medium transition hover:border-primary/40 hover:bg-muted/30"
            >
              <Icon className="h-5 w-5 shrink-0 text-primary" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
