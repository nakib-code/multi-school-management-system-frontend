"use client";

import {
  AlertCircle,
  Banknote,
  Check,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  School,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  useApproveCashPayment,
  usePendingCashPayments,
  useRejectCashPayment,
} from "@/features/payments/hooks";

const formatPrice = (amount: number | string) => {
  const value = Number(amount);

  if (Number.isNaN(value)) {
    return String(amount);
  }

  return `৳${value.toLocaleString("en-BD")}`;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getBillingLabel = (
  billingCycle: "MONTHLY" | "YEARLY" | "CUSTOM",
) => {
  switch (billingCycle) {
    case "MONTHLY":
      return "Monthly";

    case "YEARLY":
      return "Yearly";

    case "CUSTOM":
      return "Custom";

    default:
      return billingCycle;
  }
};

export default function SuperAdminCashPaymentsPage() {
  const {
    data: payments,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = usePendingCashPayments();

  const approveMutation = useApproveCashPayment();
  const rejectMutation = useRejectCashPayment();

  const [selectedPaymentId, setSelectedPaymentId] =
    useState<number | null>(null);

  const [action, setAction] = useState<
    "approve" | "reject" | null
  >(null);

  const [remarks, setRemarks] = useState("");

  const openAction = (
    paymentId: number,
    type: "approve" | "reject",
  ) => {
    setSelectedPaymentId(paymentId);
    setAction(type);
    setRemarks("");
  };

  const closeAction = () => {
    if (
      approveMutation.isPending ||
      rejectMutation.isPending
    ) {
      return;
    }

    setSelectedPaymentId(null);
    setAction(null);
    setRemarks("");
  };

  const handleConfirm = async () => {
    if (!selectedPaymentId || !action) {
      return;
    }

    try {
      if (action === "approve") {
        await approveMutation.mutateAsync({
          paymentId: selectedPaymentId,
          remarks,
        });

        toast.success("Payment approved", {
          description:
            "The cash payment has been approved and the school subscription is now active.",
        });
      } else {
        await rejectMutation.mutateAsync({
          paymentId: selectedPaymentId,
          remarks,
        });

        toast.success("Payment rejected", {
          description:
            "The cash payment request has been rejected.",
        });
      }

      closeAction();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Unable to ${action} this payment.`;

      toast.error(
        action === "approve"
          ? "Payment approval failed"
          : "Payment rejection failed",
        {
          description: message,
        },
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading cash payment requests...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>

          <h1 className="mt-5 text-xl font-semibold">
            Unable to load payments
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Something went wrong while loading pending cash
            payment requests.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const pendingPayments = payments ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Banknote className="h-5 w-5 text-amber-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Cash Payment Requests
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Review and manage pending school subscription
                cash payments.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Pending Requests
          </p>

          <p className="mt-2 text-3xl font-bold">
            {pendingPayments.length}
          </p>
        </div>

        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Pending Amount
          </p>

          <p className="mt-2 text-3xl font-bold">
            {formatPrice(
              pendingPayments.reduce(
                (total, payment) =>
                  total + Number(payment.amount),
                0,
              ),
            )}
          </p>
        </div>
      </div>

      {/* Empty */}
      {pendingPayments.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border bg-background">
          <div className="max-w-md px-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              No pending cash payments
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              All cash payment requests have been processed.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto lg:block">
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
                    Requested
                  </th>

                  <th className="px-5 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {pendingPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="transition hover:bg-muted/30"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold">
                          {payment.school.name}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Code: {payment.school.code}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {payment.school.adminName}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {payment.subscription.package.name}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {getBillingLabel(
                          payment.subscription.package
                            .billingCycle,
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {formatPrice(payment.amount)}
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      {formatDate(payment.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700">
                        {payment.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openAction(payment.id, "approve")
                          }
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white transition hover:bg-emerald-700"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openAction(payment.id, "reject")
                          }
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition hover:bg-muted"
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet cards */}
          <div className="divide-y lg:hidden">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="space-y-5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <School className="h-4 w-4 text-primary" />

                      <h2 className="font-semibold">
                        {payment.school.name}
                      </h2>
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Code: {payment.school.code}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700">
                    {payment.status}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Admin
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-sm">
                      <User className="h-3.5 w-3.5" />
                      {payment.school.adminName}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {payment.school.adminEmail}
                    </div>

                    {payment.school.adminPhone && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        {payment.school.adminPhone}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Package
                    </p>

                    <p className="mt-1 font-medium">
                      {payment.subscription.package.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {getBillingLabel(
                        payment.subscription.package
                          .billingCycle,
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-end justify-between border-t pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Amount
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {formatPrice(payment.amount)}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Requested {formatDate(payment.createdAt)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openAction(payment.id, "approve")
                      }
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-medium text-white"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openAction(payment.id, "reject")
                      }
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium"
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {action && selectedPaymentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  action === "approve"
                    ? "bg-emerald-500/10"
                    : "bg-destructive/10"
                }`}
              >
                {action === "approve" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  {action === "approve"
                    ? "Approve Cash Payment?"
                    : "Reject Cash Payment?"}
                </h2>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {action === "approve"
                    ? "This will mark the payment as paid and activate the school subscription."
                    : "This will reject the cash payment request. The subscription will remain inactive."}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="remarks"
                className="text-sm font-medium"
              >
                Remarks
                <span className="ml-1 font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>

              <textarea
                id="remarks"
                value={remarks}
                onChange={(event) =>
                  setRemarks(event.target.value)
                }
                rows={3}
                placeholder={
                  action === "approve"
                    ? "e.g. Cash received and verified."
                    : "e.g. Payment amount could not be verified."
                }
                className="mt-2 w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeAction}
                disabled={
                  approveMutation.isPending ||
                  rejectMutation.isPending
                }
                className="h-10 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={
                  approveMutation.isPending ||
                  rejectMutation.isPending
                }
                className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                  action === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-destructive hover:bg-destructive/90"
                }`}
              >
                {approveMutation.isPending ||
                rejectMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : action === "approve" ? (
                  <>
                    <Check className="h-4 w-4" />
                    Approve Payment
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    Reject Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
