"use client";

import {
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useSubscriptionPaymentHistory } from "@/features/payments/hooks";

// ====================================================
// HELPERS
// ====================================================

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

// ====================================================
// PAGE
// ====================================================

export default function OnlinePaymentsPage() {
  const {
    data: history,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useSubscriptionPaymentHistory();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // ====================================================
  // ONLINE PAYMENTS
  // ====================================================

  const onlinePayments = useMemo(() => {
    if (!history) return [];

    return history.filter(
      (payment) =>
        payment.paymentMethod.toUpperCase() === "ONLINE",
    );
  }, [history]);

  // ====================================================
  // FILTERED PAYMENTS
  // ====================================================

  const filteredPayments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return onlinePayments.filter((payment) => {
      const matchesSearch =
        !searchValue ||
        payment.school.name.toLowerCase().includes(searchValue) ||
        payment.school.code.toLowerCase().includes(searchValue) ||
        payment.subscription.package.name
          .toLowerCase()
          .includes(searchValue) ||
        payment.transactionId
          ?.toLowerCase()
          .includes(searchValue) ||
        payment.validationId
          ?.toLowerCase()
          .includes(searchValue) ||
        String(payment.id).includes(searchValue);

      const matchesStatus =
        !status || payment.status.toUpperCase() === status;

      return matchesSearch && matchesStatus;
    });
  }, [onlinePayments, search, status]);

  // ====================================================
  // SUMMARY
  // ====================================================

  const paidPayments = onlinePayments.filter(
    (payment) => payment.status.toUpperCase() === "PAID",
  );

  const pendingPayments = onlinePayments.filter(
    (payment) => payment.status.toUpperCase() === "PENDING",
  );

  const failedPayments = onlinePayments.filter(
    (payment) => payment.status.toUpperCase() === "FAILED",
  );

  const paidRevenue = paidPayments.reduce(
    (total, payment) => total + Number(payment.amount),
    0,
  );

  // ====================================================
  // LOADING
  // ====================================================

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />

          <p className="text-sm text-muted-foreground">
            Loading online payments...
          </p>
        </div>
      </div>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (isError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>

          <div>
            <h2 className="font-semibold">
              Failed to load online payments
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Something went wrong while loading online payment
              records.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/dashboard/super-admin/payments"
            className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background transition hover:bg-muted"
            aria-label="Back to payments"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <p className="text-sm text-muted-foreground">
              Super Admin / Payments
            </p>

            <h1 className="text-2xl font-semibold tracking-tight">
              Online Payments
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              View subscription payments made through online
              payment gateway.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isFetching ? "animate-spin" : ""
            }`}
          />

          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total Online Payments"
          value={onlinePayments.length}
          icon={CreditCard}
        />

        <SummaryCard
          label="Paid"
          value={paidPayments.length}
          icon={CreditCard}
        />

        <SummaryCard
          label="Pending"
          value={pendingPayments.length}
          icon={CreditCard}
        />

        <RevenueCard amount={paidRevenue} />
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-background p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search school, package, transaction..."
              className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
          >
            <option value="">All Status</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {(search || status) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatus("");
              }}
              className="h-10 rounded-lg border px-3 text-sm font-medium transition hover:bg-muted"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-background">
        {filteredPayments.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 px-4 text-center">
            <CreditCard className="h-6 w-6 text-muted-foreground" />

            <p className="font-medium">
              No online payments found
            </p>

            <p className="text-sm text-muted-foreground">
              Try changing your search or status filter.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">
                      School
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Package
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Amount
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Transaction ID
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Validation ID
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="transition hover:bg-muted/30"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {payment.school.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {payment.school.code}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {payment.subscription.package.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {payment.subscription.package.billingCycle}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {payment.currency}{" "}
                        {formatAmount(payment.amount)}
                      </td>

                      <td className="max-w-[180px] px-5 py-4">
                        <p
                          className="truncate font-mono text-xs"
                          title={payment.transactionId ?? undefined}
                        >
                          {payment.transactionId ?? "—"}
                        </p>
                      </td>

                      <td className="max-w-[180px] px-5 py-4">
                        <p
                          className="truncate font-mono text-xs"
                          title={payment.validationId ?? undefined}
                        >
                          {payment.validationId ?? "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={payment.status} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y md:hidden">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="space-y-4 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {payment.school.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {payment.school.code}
                      </p>
                    </div>

                    <StatusBadge status={payment.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem
                      label="Package"
                      value={payment.subscription.package.name}
                    />

                    <InfoItem
                      label="Amount"
                      value={`${payment.currency} ${formatAmount(
                        payment.amount,
                      )}`}
                    />

                    <InfoItem
                      label="Transaction"
                      value={payment.transactionId ?? "—"}
                    />

                    <InfoItem
                      label="Validation"
                      value={payment.validationId ?? "—"}
                    />

                    <InfoItem
                      label="Date"
                      value={formatDate(payment.createdAt)}
                    />

                    <InfoItem
                      label="Payment ID"
                      value={`#${payment.id}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Failed Payment Note */}
      {failedPayments.length > 0 && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
          <p className="text-sm font-medium">
            Failed online payments: {failedPayments.length}
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            These payments were started but were not completed
            successfully.
          </p>
        </div>
      )}
    </div>
  );
}

// ====================================================
// SUMMARY CARD
// ====================================================

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof CreditCard;
}) {
  return (
    <div className="rounded-xl border bg-background p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}

// ====================================================
// REVENUE CARD
// ====================================================

function RevenueCard({ amount }: { amount: number }) {
  return (
    <div className="rounded-xl border bg-background p-5">
      <p className="text-sm text-muted-foreground">
        Paid Online Revenue
      </p>

      <p className="mt-2 text-2xl font-semibold">
        ৳{formatAmount(amount)}
      </p>
    </div>
  );
}

// ====================================================
// INFO ITEM
// ====================================================

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p
        className="mt-1 truncate text-sm font-medium"
        title={value}
      >
        {value}
      </p>
    </div>
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