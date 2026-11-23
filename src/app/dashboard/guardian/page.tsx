"use client";

import {
  Award,
  BookOpenCheck,
  CalendarCheck,
  CreditCard,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { DashboardCard } from "@/components/layout/dashboard-card";
import { useAttendances } from "@/features/attendance/hooks";
import { useStudentFees } from "@/features/fees/hooks";
import { useResults } from "@/features/results/hooks";
import { useAuth } from "@/providers/auth-provider";

export default function GuardianDashboardPage() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;

  const attendanceQuery = useAttendances(schoolId);
  const resultsQuery = useResults(schoolId);
  const feesQuery = useStudentFees(schoolId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {user?.name ?? "Guardian"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor your child&apos;s attendance, examination results, fee payments, and daily Hefz progress.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard
          title="Attendance Records"
          value={attendanceQuery.data?.length ?? 0}
          icon={CalendarCheck}
        />
        <DashboardCard
          title="Exam Results"
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
          { label: "Attendance", href: "/dashboard/guardian/attendance", icon: CalendarCheck },
          { label: "Examinations", href: "/dashboard/guardian/exams", icon: FileText },
          { label: "Results & GPA", href: "/dashboard/guardian/results", icon: Award },
          { label: "Fees & Payments", href: "/dashboard/guardian/fees", icon: CreditCard },
          { label: "Hefz & Najera Progress", href: "/dashboard/guardian/hefz", icon: BookOpenCheck },
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
