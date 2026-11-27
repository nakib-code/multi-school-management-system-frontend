"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  usePendingSubscriptionPayments,
  useRejectSubscriptionPayment,
  useVerifySubscriptionPayment,
} from "@/features/payments/hooks";
import type { SubscriptionPaymentRecord } from "@/features/payments/types";
import { getApiErrorMessage } from "@/lib/api";

export default function PendingSubscriptionPaymentsPage() {
  const {
    data: payments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = usePendingSubscriptionPayments();
  const verifyMutation = useVerifySubscriptionPayment();
  const rejectMutation = useRejectSubscriptionPayment();

  const [rejectTarget, setRejectTarget] =
    useState<SubscriptionPaymentRecord | null>(null);
  const [reason, setReason] = useState("");

  const handleReject = async () => {
    if (!rejectTarget || reason.trim().length < 3) return;
    await rejectMutation.mutateAsync({
      paymentId: rejectTarget.id,
      rejectionReason: reason.trim(),
    });
    setRejectTarget(null);
    setReason("");
  };

  if (isLoading) return <LoadingState message="Loading pending payments..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load pending payments")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Pending Manual Payments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verify bKash, Nagad, and Rocket transaction IDs to activate
          institution subscriptions.
        </p>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No pending payments"
          description="All submitted subscription payments have been reviewed."
        />
      ) : (
        <div className="grid gap-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex flex-col justify-between gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">
                    {payment.school?.name ?? `School #${payment.schoolId}`}
                  </p>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {payment.paymentMethod}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Package:{" "}
                  <strong>{payment.subscription?.package?.name ?? "—"}</strong>{" "}
                  • Amount:{" "}
                  <strong>
                    ৳{Number(payment.paidAmount).toLocaleString()}
                  </strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  TrxID:{" "}
                  <span className="font-mono font-medium text-foreground">
                    {payment.trxId}
                  </span>{" "}
                  • Sender:{" "}
                  <span className="font-mono">{payment.senderNumber}</span>
                  {payment.receiverNumber
                    ? ` → Receiver: ${payment.receiverNumber}`
                    : ""}
                </p>
                {payment.remarks && (
                  <p className="text-xs text-muted-foreground">
                    Note: {payment.remarks}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => verifyMutation.mutate(payment.id)}
                  disabled={verifyMutation.isPending}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Verify &amp; Activate
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setRejectTarget(payment)}
                  disabled={rejectMutation.isPending}
                  className="gap-1.5"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!rejectTarget}
        onClose={() => {
          setRejectTarget(null);
          setReason("");
        }}
        title="Reject Subscription Payment"
        description={`Provide a reason for rejecting TrxID ${rejectTarget?.trxId ?? ""}.`}
      >
        <div className="space-y-4">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Transaction ID not found in bKash statement"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectTarget(null);
                setReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={reason.trim().length < 3 || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Confirm Reject"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
