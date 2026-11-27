"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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

  const [verifyTarget, setVerifyTarget] =
    useState<SubscriptionPaymentRecord | null>(null);
  const [rejectTarget, setRejectTarget] =
    useState<SubscriptionPaymentRecord | null>(null);
  const [reason, setReason] = useState("");

  const handleConfirmVerify = async () => {
    if (!verifyTarget) return;
    try {
      await verifyMutation.mutateAsync(verifyTarget.id);
      setVerifyTarget(null);
    } catch {
      // Handled via mutation onError toast
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || reason.trim().length < 3) return;
    try {
      await rejectMutation.mutateAsync({
        paymentId: rejectTarget.id,
        rejectionReason: reason.trim(),
      });
      setRejectTarget(null);
      setReason("");
    } catch {
      // Handled via mutation onError toast
    }
  };

  const handleCopyTrx = async (trxId: string) => {
    try {
      await navigator.clipboard.writeText(trxId);
      toast.success("TrxID copied");
    } catch {
      toast.error("Failed to copy TrxID");
    }
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
          Verify bKash, Nagad, and Rocket transaction IDs to activate or renew
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
          {payments.map((payment) => {
            const expectedPrice = Number(
              payment.subscription?.package?.price ?? 0,
            );
            const paidAmount = Number(payment.paidAmount);
            const hasAmountMismatch =
              expectedPrice > 0 && Math.abs(paidAmount - expectedPrice) > 0.01;
            const isRenewal = payment.subscription?.status === "ACTIVE";

            return (
              <div
                key={payment.id}
                className={`flex flex-col justify-between gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center ${
                  hasAmountMismatch ? "border-amber-400 bg-amber-50/30" : ""
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">
                      {payment.school?.name ?? `School #${payment.schoolId}`}
                    </p>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {payment.paymentMethod}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                        isRenewal
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {isRenewal ? "Renewal" : "New Activation"}
                    </span>
                    {hasAmountMismatch && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                        <AlertTriangle className="h-3 w-3" />
                        Amount Mismatch
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Package:{" "}
                    <strong>
                      {payment.subscription?.package?.name ?? "—"}
                    </strong>{" "}
                    • Paid:{" "}
                    <strong
                      className={
                        hasAmountMismatch ? "text-red-700" : "text-foreground"
                      }
                    >
                      ৳{paidAmount.toLocaleString()}
                    </strong>
                    {expectedPrice > 0 && (
                      <span className="ml-1.5 text-xs">
                        (Expected: ৳{expectedPrice.toLocaleString()})
                      </span>
                    )}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      TrxID:{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {payment.trxId}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleCopyTrx(payment.trxId)}
                      className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] hover:bg-muted"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </button>
                    <span>
                      • Sender:{" "}
                      <span className="font-mono">{payment.senderNumber}</span>
                    </span>
                    {payment.receiverNumber && (
                      <span>→ Receiver: {payment.receiverNumber}</span>
                    )}
                    <span>
                      • Submitted:{" "}
                      {new Date(payment.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {payment.remarks && (
                    <p className="text-xs text-muted-foreground">
                      Note: {payment.remarks}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setVerifyTarget(payment)}
                    disabled={verifyMutation.isPending}
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isRenewal ? "Verify & Renew" : "Verify & Activate"}
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
            );
          })}
        </div>
      )}

      {/* Verify Confirmation Modal */}
      <Modal
        open={Boolean(verifyTarget)}
        onClose={() => setVerifyTarget(null)}
        title="Confirm Payment Verification"
        description="Double-check the transaction details before activating or renewing this subscription."
      >
        {verifyTarget && (
          <div className="space-y-4 text-sm">
            <div className="space-y-2 rounded-xl border bg-muted/30 p-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">School</span>
                <span className="font-semibold">
                  {verifyTarget.school?.name ?? `#${verifyTarget.schoolId}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Action</span>
                <span className="font-medium">
                  {verifyTarget.subscription?.status === "ACTIVE"
                    ? "Subscription Renewal"
                    : "New Subscription Activation"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package</span>
                <span className="font-medium">
                  {verifyTarget.subscription?.package?.name ?? "—"} (Expected: ৳
                  {Number(
                    verifyTarget.subscription?.package?.price ?? 0,
                  ).toLocaleString()}
                  )
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid Amount</span>
                <span className="font-bold">
                  ৳{Number(verifyTarget.paidAmount).toLocaleString()} via{" "}
                  {verifyTarget.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TrxID</span>
                <span className="font-mono font-bold">
                  {verifyTarget.trxId}
                </span>
              </div>
            </div>

            {Number(verifyTarget.subscription?.package?.price ?? 0) > 0 &&
              Math.abs(
                Number(verifyTarget.paidAmount) -
                  Number(verifyTarget.subscription?.package?.price ?? 0),
              ) > 0.01 && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Warning: Paid amount does not match the expected package
                    price. Only proceed if you intentionally approve this
                    amount.
                  </span>
                </div>
              )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVerifyTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void handleConfirmVerify()}
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending
                  ? "Verifying..."
                  : "Confirm & Activate"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={Boolean(rejectTarget)}
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
              onClick={() => void handleReject()}
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
