"use client";

import { useReportOverview } from "@/features/reports/hooks";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  Package,
  RefreshCw,
  UserRound,
  Users,
} from "lucide-react";


const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({
  title,
  value,
  icon,
  description,
}: StatCardProps) {
  return (
    <div className="rounded-xl border bg-background p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}

interface BreakdownRowProps {
  label: string;
  value: string | number;
}

function BreakdownRow({ label, value }: BreakdownRowProps) {
  return (
    <div className="flex items-center justify-between border-b py-3 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>

      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function ReportOverview() {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useReportOverview();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "schools",
            "users",
            "subscriptions",
            "revenue",
            "packages",
            "requests",
          ].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-xl border bg-muted/40"
            />
          ))}
        </div>

        {/* Breakdown Skeleton */}
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            "schools",
            "users",
            "subscriptions",
            "payments",
          ].map((item) => (
            <div
              key={item}
              className="h-72 animate-pulse rounded-xl border bg-muted/40"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-xl border bg-background">
        <div className="rounded-full bg-destructive/10 p-3 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>

        <div className="text-center">
          <h2 className="font-semibold">Failed to load reports</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Something went wrong while loading report data.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  const { schools, users, subscriptions, payments, packages, customPackageRequests } =
    data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Reports
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View overall system statistics and financial reports.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isFetching ? "animate-spin" : ""
            }`}
          />

          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Schools"
          value={schools.total}
          icon={<Building2 className="h-5 w-5" />}
          description={`${schools.active} active schools`}
        />

        <StatCard
          title="Total Users"
          value={users.total}
          icon={<Users className="h-5 w-5" />}
          description={`${users.student} students`}
        />

        <StatCard
          title="Active Subscriptions"
          value={subscriptions.active}
          icon={<CheckCircle2 className="h-5 w-5" />}
          description={`${subscriptions.total} total subscriptions`}
        />

        <StatCard
          title="Total Revenue"
          value={formatAmount(payments.totalRevenue)}
          icon={<CreditCard className="h-5 w-5" />}
          description={`${payments.paidPayments} paid payments`}
        />

        <StatCard
          title="Packages"
          value={packages.total}
          icon={<Package className="h-5 w-5" />}
          description={`${packages.active} active packages`}
        />

        <StatCard
          title="Custom Requests"
          value={customPackageRequests.total}
          icon={<FileCheck2 className="h-5 w-5" />}
          description={`${customPackageRequests.pending} pending requests`}
        />
      </div>

      {/* Reports Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Schools */}
        <div className="rounded-xl border bg-background p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Building2 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">Schools</h2>
              <p className="text-xs text-muted-foreground">
                School status overview
              </p>
            </div>
          </div>

          <div>
            <BreakdownRow
              label="Total"
              value={schools.total}
            />

            <BreakdownRow
              label="Active"
              value={schools.active}
            />

            <BreakdownRow
              label="Pending"
              value={schools.pending}
            />

            <BreakdownRow
              label="Blocked"
              value={schools.blocked}
            />

            <BreakdownRow
              label="Rejected"
              value={schools.rejected}
            />
          </div>
        </div>

        {/* Users */}
        <div className="rounded-xl border bg-background p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">Users</h2>
              <p className="text-xs text-muted-foreground">
                Users by role
              </p>
            </div>
          </div>

          <div>
            <BreakdownRow
              label="Total Users"
              value={users.total}
            />

            <BreakdownRow
              label="Super Admin"
              value={users.superAdmin}
            />

            <BreakdownRow
              label="Admin"
              value={users.admin}
            />

            <BreakdownRow
              label="Manager"
              value={users.manager}
            />

            <BreakdownRow
              label="Teacher"
              value={users.teacher}
            />

            <BreakdownRow
              label="Student"
              value={users.student}
            />

            <BreakdownRow
              label="Guardian"
              value={users.guardian}
            />
          </div>
        </div>

        {/* Subscriptions */}
        <div className="rounded-xl border bg-background p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">Subscriptions</h2>
              <p className="text-xs text-muted-foreground">
                Subscription status overview
              </p>
            </div>
          </div>

          <div>
            <BreakdownRow
              label="Total"
              value={subscriptions.total}
            />

            <BreakdownRow
              label="Active"
              value={subscriptions.active}
            />

            <BreakdownRow
              label="Pending"
              value={subscriptions.pending}
            />

            <BreakdownRow
              label="Expired"
              value={subscriptions.expired}
            />

            <BreakdownRow
              label="Cancelled"
              value={subscriptions.cancelled}
            />
          </div>
        </div>

        {/* Payments */}
        <div className="rounded-xl border bg-background p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">Payments</h2>
              <p className="text-xs text-muted-foreground">
                Payment and revenue overview
              </p>
            </div>
          </div>

          <div>
            <BreakdownRow
              label="Total Revenue"
              value={formatAmount(payments.totalRevenue)}
            />

            <BreakdownRow
              label="Online Revenue"
              value={formatAmount(payments.onlineRevenue)}
            />

            <BreakdownRow
              label="Cash Revenue"
              value={formatAmount(payments.cashRevenue)}
            />

            <BreakdownRow
              label="Pending Cash"
              value={formatAmount(payments.pendingCashAmount)}
            />

            <BreakdownRow
              label="Total Payments"
              value={payments.totalPayments}
            />

            <BreakdownRow
              label="Paid Payments"
              value={payments.paidPayments}
            />

            <BreakdownRow
              label="Pending Payments"
              value={payments.pendingPayments}
            />

            <BreakdownRow
              label="Failed Payments"
              value={payments.failedPayments}
            />

            <BreakdownRow
              label="Cancelled Payments"
              value={payments.cancelledPayments}
            />
          </div>
        </div>

        {/* Packages */}
        <div className="rounded-xl border bg-background p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Package className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">Packages</h2>
              <p className="text-xs text-muted-foreground">
                Package overview
              </p>
            </div>
          </div>

          <div>
            <BreakdownRow
              label="Total Packages"
              value={packages.total}
            />

            <BreakdownRow
              label="Active"
              value={packages.active}
            />

            <BreakdownRow
              label="Inactive"
              value={packages.inactive}
            />

            <BreakdownRow
              label="Custom Packages"
              value={packages.custom}
            />
          </div>
        </div>

        {/* Custom Package Requests */}
        <div className="rounded-xl border bg-background p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <FileCheck2 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold">
                Custom Package Requests
              </h2>

              <p className="text-xs text-muted-foreground">
                Custom package request status
              </p>
            </div>
          </div>

          <div>
            <BreakdownRow
              label="Total"
              value={customPackageRequests.total}
            />

            <BreakdownRow
              label="Pending"
              value={customPackageRequests.pending}
            />

            <BreakdownRow
              label="Approved"
              value={customPackageRequests.approved}
            />

            <BreakdownRow
              label="Rejected"
              value={customPackageRequests.rejected}
            />

            <BreakdownRow
              label="Cancelled"
              value={customPackageRequests.cancelled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}