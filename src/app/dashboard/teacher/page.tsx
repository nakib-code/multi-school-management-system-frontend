"use client";

import {
  Award,
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  FileText,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { DashboardCard } from "@/components/layout/dashboard-card";
import { LoadingState } from "@/components/shared/loading";
import { useExams } from "@/features/exams/hooks";
import { useTeacherSalaries } from "@/features/salaries/hooks";
import { useTeacherAssignments } from "@/features/teachers/hooks";
import { useAuth } from "@/providers/auth-provider";

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;

  const assignmentsQuery = useTeacherAssignments(schoolId);
  const examsQuery = useExams(schoolId);
  const salariesQuery = useTeacherSalaries(schoolId);

  if (assignmentsQuery.isLoading) {
    return <LoadingState message="Loading teacher workspace..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {user?.name ?? "Teacher"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your assigned classes, daily attendance, exam marks, and Hefz
          Sobok logs.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">
        <DashboardCard
          title="Class Assignments"
          value={assignmentsQuery.data?.length ?? 0}
          icon={BookOpen}
        />
        <DashboardCard
          title="Scheduled Exams"
          value={examsQuery.data?.length ?? 0}
          icon={FileText}
        />
        <div className="col-span-2 sm:col-span-1">
          <DashboardCard
            title="Salary Records"
            value={salariesQuery.data?.length ?? 0}
            icon={Wallet}
          />
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            label: "Daily Class Diary",
            href: "/dashboard/teacher/diary",
            icon: BookOpen,
          },
          {
            label: "Mark Attendance",
            href: "/dashboard/teacher/attendance",
            icon: CalendarCheck,
          },
          {
            label: "My Classes & Alerts",
            href: "/dashboard/teacher/classes",
            icon: BookOpen,
          },
          {
            label: "Record Exam Results",
            href: "/dashboard/teacher/results",
            icon: Award,
          },
          {
            label: "Hefz Daily Sobok",
            href: "/dashboard/teacher/hefz",
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
