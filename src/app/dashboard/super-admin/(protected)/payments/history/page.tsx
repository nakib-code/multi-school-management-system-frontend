"use client";

import { History, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Input } from "@/components/ui/input";
import { useSubscriptionPaymentHistory } from "@/features/payments/hooks";
import type {
  MobilePaymentMethod,
  SubscriptionPaymentStatus,
} from "@/features/payments/types";
import { getApiErrorMessage } from "@/lib/api";

export default function SubscriptionPaymentHistoryPage() {
  const [status, setStatus] = useState<SubscriptionPaymentStatus | "">("");
  const [method, setMethod] = useState<MobilePaymentMethod | "">("");
  const [search, setSearch] = useState("");

  const { data: payments = [], isLoading, isError, error, refetch } =
    useSubscriptionPaymentHistory({
      ...(status ? { status } : {}),
      ...(method ? { paymentMethod: method } : {}),
    });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter(
      (p) =>
        p.trxId.toLowerCase().includes(q) ||
        p.senderNumber.toLowerCase().includes(q) ||
        p.school?.name?.toLowerCase().includes(q),
    );
  }, [payments, search]);

  if (isLoading) return <LoadingState message="Loading payment history..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load payment history")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Complete history of all manual subscription payment submissions.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search institution, TrxID, sender..."
            className="pl-9"
          />
        </div>

        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as MobilePaymentMethod | "")}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">All Methods</option>
          <option value="BKASH">bKash</option>
          <option value="NAGAD">Nagad</option>
          <option value="ROCKET">Rocket</option>
        </select>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as SubscriptionPaymentStatus | "")
          }
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="No payments found"
          description="Try adjusting your search or status filter."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Institution</th>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">Method &amp; TrxID</th>
                <th className="px-4 py-3">Sender</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">
                    {p.school?.name ?? `School #${p.schoolId}`}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {p.subscription?.package?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{p.paymentMethod}</span>
                    <p className="font-mono text-xs text-muted-foreground">{p.trxId}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{p.senderNumber}</td>
                  <td className="px-4 py-3 font-medium">
                    ৳{Number(p.paidAmount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
