"use client";

import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Users,
  Wallet,
} from "lucide-react";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { useSchoolReportOverview } from "@/features/reports/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const formatBDT = (amount: number) =>
  `৳${Number(amount || 0).toLocaleString("en-BD")}`;

export function SchoolReportsWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;

  const { data, isLoading, isError, error, refetch } =
    useSchoolReportOverview(schoolId);

  if (isLoading)
    return <LoadingState message="Loading institution reports..." />;
  if (isError || !data) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          error,
          "Failed to load institution reports",
        )}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Institution Reports
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live overview of fee collection, teacher payroll, attendance, and
          admissions.
        </p>
      </div>

      {/* Fee Collection */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Wallet className="h-4 w-4 text-primary" />
          Fee Collection &amp; Dues
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Billed"
            value={formatBDT(data.fees.totalBilled)}
          />
          <StatCard
            label="Total Collected"
            value={formatBDT(data.fees.totalCollected)}
            sub={`${data.fees.paidCount} paid • ${data.fees.partialCount} partial`}
          />
          <StatCard
            label="Outstanding Dues"
            value={formatBDT(data.fees.totalDue)}
            sub={`${data.fees.unpaidCount} unpaid invoices`}
          />
          <StatCard
            label="Pending TrxID Verifications"
            value={String(data.fees.pendingVerifications)}
            sub="Awaiting staff review"
          />
        </div>
      </section>

      {/* Payroll */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Users className="h-4 w-4 text-primary" />
          Teacher Payroll Summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Gross Payroll"
            value={formatBDT(data.payroll.totalGross)}
            sub={`${data.payroll.totalRecords} salary records`}
          />
          <StatCard
            label="Total Disbursed"
            value={formatBDT(data.payroll.totalPaid)}
            sub={`${data.payroll.paidCount} paid`}
          />
          <StatCard
            label="Pending Disbursement"
            value={formatBDT(data.payroll.totalPending)}
            sub={`${data.payroll.unpaidCount} unpaid`}
          />
        </div>
      </section>

      {/* Academics & Attendance */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <BookOpen className="h-4 w-4 text-primary" />
          Academics &amp; 30-Day Attendance
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Active Students"
            value={String(data.academics.activeStudents)}
            sub={`${data.academics.activeClasses} active classes`}
          />
          <StatCard
            label="Active Teachers"
            value={String(data.academics.activeTeachers)}
          />
          <StatCard
            label="30-Day Attendance Rate"
            value={`${data.academics.attendanceRate30d}%`}
            sub={`${data.academics.presentAttendance30d} / ${data.academics.totalAttendance30d} present`}
          />
          <StatCard
            label="Exams &amp; Results"
            value={String(data.academics.totalExams)}
            sub={`${data.academics.totalResults} result entries`}
          />
        </div>
      </section>

      {/* Admissions */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <GraduationCap className="h-4 w-4 text-primary" />
          Admissions Pipeline
        </h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard
            label="Total Applications"
            value={String(data.admissions.total)}
          />
          <StatCard
            label="Pending Review"
            value={String(data.admissions.pending)}
          />
          <StatCard label="Approved" value={String(data.admissions.approved)} />
          <StatCard label="Rejected" value={String(data.admissions.rejected)} />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between text-xs font-medium uppercase text-muted-foreground">
        <span>{label}</span>
        <ClipboardCheck className="h-4 w-4 text-muted-foreground/60" />
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
