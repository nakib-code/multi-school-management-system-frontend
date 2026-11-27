"use client";

import {
  Award,
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  CreditCard,
  FileText,
  GraduationCap,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { DashboardCard } from "@/components/layout/dashboard-card";
import {
  useMyLinkedStudents,
  useStudentCalendar,
} from "@/features/attendance/hooks";
import { useStudentFees } from "@/features/fees/hooks";
import { useResults } from "@/features/results/hooks";
import { getSchoolCurrentMonthStr } from "@/lib/attendance-date";
import { useAuth } from "@/providers/auth-provider";

export default function GuardianDashboardPage() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const currentMonth = getSchoolCurrentMonthStr();

  const linkedStudentsQuery = useMyLinkedStudents(schoolId);
  const linkedStudents = linkedStudentsQuery.data ?? [];
  const primaryStudent = linkedStudents[0];

  const calendarQuery = useStudentCalendar(
    schoolId,
    {
      month: currentMonth,
      ...(primaryStudent ? { studentId: primaryStudent.id } : {}),
    },
    { enabled: schoolId > 0 && Boolean(primaryStudent), autoRefresh: true },
  );
  const resultsQuery = useResults(schoolId);
  const feesQuery = useStudentFees(schoolId);

  const attendanceDisplay = calendarQuery.data
    ? `${calendarQuery.data.summary.rate}%`
    : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {user?.name ?? "Guardian"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor your child&apos;s attendance, daily diary, examination
          results, fee payments, and Hefz progress.
        </p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">
        <DashboardCard
          title="This Month Attendance"
          value={attendanceDisplay}
          icon={CalendarCheck}
        />
        <DashboardCard
          title="Exam Results"
          value={resultsQuery.data?.length ?? 0}
          icon={Award}
        />
        <div className="col-span-2 sm:col-span-1">
          <DashboardCard
            title="Fee Invoices"
            value={feesQuery.data?.length ?? 0}
            icon={CreditCard}
          />
        </div>
      </div>

      {/* Linked Children Cards */}
      {linkedStudents.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            My Children ({linkedStudents.length})
          </h2>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {linkedStudents.map((child) => (
              <div
                key={child.id}
                className="surface-panel flex flex-col justify-between gap-3 p-3.5 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-primary/10 text-primary">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {child.firstName} {child.lastName ?? ""}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      ID: {child.studentId}
                      {child.activeEnrollment?.class
                        ? ` • ${child.activeEnrollment.class.name}`
                        : ""}
                      {child.activeEnrollment?.section
                        ? ` (${child.activeEnrollment.section.name})`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/guardian/students/${child.id}`}
                    className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-[11px] border bg-background px-3 text-xs font-medium transition hover:bg-muted sm:flex-none"
                  >
                    <UserRound className="h-3.5 w-3.5" />
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/guardian/attendance"
                    className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-[11px] bg-primary px-3 text-xs font-medium text-primary-foreground transition hover:opacity-90 sm:flex-none"
                  >
                    <CalendarCheck className="h-3.5 w-3.5" />
                    Attendance
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            label: "Daily Class Diary",
            href: "/dashboard/guardian/diary",
            icon: BookOpen,
          },
          {
            label: "Attendance Sheet & Leave",
            href: "/dashboard/guardian/attendance",
            icon: CalendarCheck,
          },
          {
            label: "Examinations",
            href: "/dashboard/guardian/exams",
            icon: FileText,
          },
          {
            label: "Results & GPA",
            href: "/dashboard/guardian/results",
            icon: Award,
          },
          {
            label: "Fees & Payments",
            href: "/dashboard/guardian/fees",
            icon: CreditCard,
          },
          {
            label: "Hefz & Najera Progress",
            href: "/dashboard/guardian/hefz",
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
