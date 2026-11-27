"use client";

import { CreditCard, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Input } from "@/components/ui/input";
import { useSubscriptions } from "@/features/super-admin/subscriptions/use-subscriptions";
import { getApiErrorMessage } from "@/lib/api";

const statusStyle: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  EXPIRED: "bg-slate-100 text-slate-700 border-slate-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function SubscriptionList() {
  const {
    data: subscriptions = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSubscriptions();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subscriptions.filter((sub) => {
      if (statusFilter !== "ALL" && sub.status !== statusFilter) return false;
      if (!q) return true;
      return (
        sub.school?.name?.toLowerCase().includes(q) ||
        sub.school?.code?.toLowerCase().includes(q) ||
        sub.package?.name?.toLowerCase().includes(q)
      );
    });
  }, [subscriptions, search, statusFilter]);

  if (isLoading) return <LoadingState message="Loading subscriptions..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load subscriptions")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by school or package..."
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No subscriptions found"
          description="No school subscriptions match your current filters."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Institution</th>
                <th className="px-4 py-3 font-medium">Package</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Validity</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {sub.school?.name ?? `School #${sub.schoolId}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sub.school?.code ?? ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {sub.package?.name ?? `Package #${sub.packageId}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {sub.package?.billingCycle ?? ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    ৳{Number(sub.price).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(sub.startDate).toLocaleDateString()} –{" "}
                    {new Date(sub.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        statusStyle[sub.status] ?? "bg-muted text-foreground"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/super-admin/subscriptions/${sub.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Manage
                    </Link>
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
