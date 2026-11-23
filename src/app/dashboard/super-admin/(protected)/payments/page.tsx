"use client";

import {
  CheckCircle2,
  Clock,
  CreditCard,
  History,
  Smartphone,
  Wallet,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import {
  useSubscriptionPaymentHistory,
  useSubscriptionPaymentSummary,
} from "@/features/payments/hooks";
import { getApiErrorMessage } from "@/lib/api";

const formatBDT = (amount: number) => `৳${Number(amount || 0).toLocaleString("en-BD")}`;

export default function SuperAdminPaymentsOverviewPage() {
  const summaryQuery = useSubscriptionPaymentSummary();
  const historyQuery = useSubscriptionPaymentHistory();

  if (summaryQuery.isLoading || historyQuery.isLoading) {
    return <LoadingState message="Loading subscription payment overview..." />;
  }

  if (summaryQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(summaryQuery.error, "Failed to load payment summary")}
        onRetry={() => summaryQuery.refetch()}
      />
    );
  }

  const summary = summaryQuery.data;
  const recent = (historyQuery.data ?? []).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Subscription Payments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verify manual bKash, Nagad, and Rocket subscription payments and track platform revenue.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/super-admin/payments/cash"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Clock className="h-4 w-4" />
            Pending Queue ({summary?.pendingPayments ?? 0})
          </Link>
          <Link
            href="/dashboard/super-admin/payments/history"
            className="inline-flex h-9 items-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium hover:bg-muted"
          >
            <History className="h-4 w-4" />
            Full History
          </Link>
        </div>
      </div>

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase">Total Revenue</span>
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold">{formatBDT(summary.totalRevenue)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.verifiedPayments} verified payments
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase">bKash Revenue</span>
              <Smartphone className="h-4 w-4 text-pink-600" />
            </div>
            <p className="mt-2 text-2xl font-bold">{formatBDT(summary.bkashRevenue)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Verified bKash</p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase">Nagad / Rocket</span>
              <CreditCard className="h-4 w-4 text-orange-600" />
            </div>
            <p className="mt-2 text-2xl font-bold">
              {formatBDT(summary.nagadRevenue + summary.rocketRevenue)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Nagad {formatBDT(summary.nagadRevenue)} • Rocket {formatBDT(summary.rocketRevenue)}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium uppercase">Pending Verification</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-bold">{formatBDT(summary.pendingAmount)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.pendingPayments} pending • {summary.rejectedPayments} rejected
            </p>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold">Recent Subscription Payments</h2>
          <Link
            href="/dashboard/super-admin/payments/history"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Wallet}
              title="No subscription payments yet"
              description="Manual bKash, Nagad, and Rocket submissions from institutions will appear here."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Institution</th>
                  <th className="px-4 py-3">Method &amp; TrxID</th>
                  <th className="px-4 py-3">Sender</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recent.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.school?.name ?? `School #${p.schoolId}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.subscription?.package?.name ?? ""}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{p.paymentMethod}</span>
                      <p className="font-mono text-xs text-muted-foreground">{p.trxId}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">{p.senderNumber}</td>
                    <td className="px-4 py-3 font-medium">{formatBDT(p.paidAmount)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium">
                        {p.status === "VERIFIED" && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                        {p.status === "PENDING" && <Clock className="h-3 w-3 text-amber-600" />}
                        {p.status === "REJECTED" && <XCircle className="h-3 w-3 text-rose-600" />}
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
