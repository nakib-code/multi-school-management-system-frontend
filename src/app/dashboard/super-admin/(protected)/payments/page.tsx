"use client";

import {
  AlertCircle,
  ArrowRight,
  Banknote,
  CreditCard,
  DollarSign,
  Loader2,
  RefreshCw,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import {
  useSubscriptionPaymentHistory,
  useSubscriptionPaymentSummary,
} from "@/features/payments/hooks";

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PaymentsPage() {
  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useSubscriptionPaymentSummary();

  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
    refetch: refetchHistory,
  } = useSubscriptionPaymentHistory();

  const isLoading = summaryLoading || historyLoading;
  const hasError = summaryError || historyError;

  const handleRefresh = () => {
    refetchSummary();
    refetchHistory();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading payment information...
          </p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>

          <div>
            <h2 className="font-semibold">Failed to load payments</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Something went wrong while loading payment information.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const recentPayments = history?.slice(0, 5) ?? [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Super Admin</p>

          <h1 className="text-2xl font-semibold tracking-tight">
            Payments
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage subscription payments and payment history.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Revenue Summary */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Payment Overview</h2>
          <p className="text-sm text-muted-foreground">
            Current subscription payment summary.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Revenue */}
          <div className="rounded-xl border bg-background p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Revenue
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  ৳{formatAmount(summary?.totalRevenue ?? 0)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>

          {/* Online Revenue */}
          <div className="rounded-xl border bg-background p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Online Revenue
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  ৳{formatAmount(summary?.onlineRevenue ?? 0)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Cash Revenue */}
          <div className="rounded-xl border bg-background p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Cash Revenue
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  ৳{formatAmount(summary?.cashRevenue ?? 0)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Banknote className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Pending Cash */}
          <div className="rounded-xl border bg-background p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Pending Cash
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  ৳{formatAmount(summary?.pendingCashAmount ?? 0)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Wallet className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Status */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Payment Status</h2>
          <p className="text-sm text-muted-foreground">
            Payment status breakdown.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatusCard
            label="Total Payments"
            value={summary?.totalPayments ?? 0}
          />

          <StatusCard
            label="Paid"
            value={summary?.paidPayments ?? 0}
          />

          <StatusCard
            label="Pending"
            value={summary?.pendingPayments ?? 0}
          />

          <StatusCard
            label="Failed"
            value={summary?.failedPayments ?? 0}
          />

          <StatusCard
            label="Cancelled"
            value={summary?.cancelledPayments ?? 0}
          />
        </div>
      </section>

      {/* Payment Actions */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Payment Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage and review subscription payments.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <PaymentActionCard
            title="Cash Payments"
            description="Review and approve pending cash payments."
            href="/dashboard/super-admin/payments/cash"
            icon={Banknote}
          />

          <PaymentActionCard
            title="Online Payments"
            description="View online subscription payment information."
            href="/dashboard/super-admin/payments/online"
            icon={CreditCard}
          />

          <PaymentActionCard
            title="Payment History"
            description="View all subscription payment records."
            href="/dashboard/super-admin/payments/history"
            icon={Wallet}
          />
        </div>
      </section>

      {/* Recent Payments */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Recent Payments</h2>
            <p className="text-sm text-muted-foreground">
              Latest subscription payment activity.
            </p>
          </div>

          {history && history.length > 5 && (
            <Link
              href="/dashboard/super-admin/payments/history"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border bg-background">
          {recentPayments.length === 0 ? (
            <div className="flex min-h-[180px] items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No payment history found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">School</th>
                    <th className="px-5 py-3 font-medium">Package</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Method</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {recentPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="transition hover:bg-muted/30"
                    >
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-medium">
                            {payment.school.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.school.code}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        {payment.subscription.package.name}
                      </td>

                      <td className="px-5 py-3 font-medium">
                        {payment.currency}{" "}
                        {formatAmount(payment.amount)}
                      </td>

                      <td className="px-5 py-3">
                        {payment.paymentMethod}
                      </td>

                      <td className="px-5 py-3">
                        <StatusBadge status={payment.status} />
                      </td>

                      <td className="px-5 py-3 text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ====================================================
// STATUS CARD
// ====================================================

function StatusCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-background p-5">
      <p className="text-sm text-muted-foreground">{label}</p>

      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

// ====================================================
// PAYMENT ACTION CARD
// ====================================================

function PaymentActionCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: typeof Banknote;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border bg-background p-5 transition hover:border-primary/40 hover:bg-muted/20"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
      </div>

      <h3 className="mt-4 font-semibold">{title}</h3>

      <p className="mt-1 text-sm text-muted-foreground">
        {description}
      </p>
    </Link>
  );
}

// ====================================================
// STATUS BADGE
// ====================================================

function StatusBadge({ status }: { status: string }) {
  const normalizedStatus = status.toUpperCase();

  const className =
    normalizedStatus === "PAID"
      ? "bg-green-500/10 text-green-600"
      : normalizedStatus === "PENDING"
        ? "bg-yellow-500/10 text-yellow-600"
        : normalizedStatus === "FAILED"
          ? "bg-red-500/10 text-red-600"
          : normalizedStatus === "CANCELLED"
            ? "bg-muted text-muted-foreground"
            : "bg-muted text-muted-foreground";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {normalizedStatus}
    </span>
  );
}