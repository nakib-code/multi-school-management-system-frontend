"use client";

import { Smartphone } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { useSubscriptionPaymentHistory } from "@/features/payments/hooks";
import { getApiErrorMessage } from "@/lib/api";

export default function VerifiedMobilePaymentsPage() {
  const {
    data: payments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSubscriptionPaymentHistory({ status: "VERIFIED" });

  if (isLoading) return <LoadingState message="Loading verified payments..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load verified payments")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Verified Mobile Banking Payments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All verified bKash, Nagad, and Rocket subscription transactions.
        </p>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={Smartphone}
          title="No verified payments yet"
          description="Verified mobile banking transactions will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Institution</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">TrxID</th>
                <th className="px-4 py-3">Sender</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Verified At</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">
                    {p.school?.name ?? `School #${p.schoolId}`}
                  </td>
                  <td className="px-4 py-3">{p.paymentMethod}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.trxId}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {p.senderNumber}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    ৳{Number(p.paidAmount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {p.verifiedAt
                      ? new Date(p.verifiedAt).toLocaleString()
                      : "—"}
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
