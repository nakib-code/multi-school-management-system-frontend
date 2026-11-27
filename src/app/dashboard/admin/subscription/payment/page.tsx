"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Printer,
  Receipt,
  RefreshCw,
  Smartphone,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Modal } from "@/components/modals/modal";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  usePaymentMethods,
  useSubmitSubscriptionPayment,
} from "@/features/payments/hooks";
import type { MobilePaymentMethod } from "@/features/payments/types";
import { useMySubscription } from "@/features/subscriptions/hooks";
import type { MySubscriptionPayment } from "@/features/subscriptions/types";
import { getApiErrorMessage } from "@/lib/api";

const ACCOUNT_TYPE_HINT: Record<string, string> = {
  PERSONAL: "Send Money (Personal)",
  MERCHANT: "Make Payment (Merchant)",
  AGENT: "Cash Out (Agent)",
};

const statusPillClass = (status: string) => {
  switch (status) {
    case "ACTIVE":
    case "VERIFIED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "REJECTED":
    case "EXPIRED":
    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
};

export default function AdminSubscriptionPaymentPage() {
  const subQuery = useMySubscription();
  const methodsQuery = usePaymentMethods();
  const submitMutation = useSubmitSubscriptionPayment();
  const formRef = useRef<HTMLDivElement | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState<MobilePaymentMethod>("BKASH");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [receiptPayment, setReceiptPayment] =
    useState<MySubscriptionPayment | null>(null);

  const subscription = subQuery.data;
  const methods = methodsQuery.data;
  const targetSub = subscription?.pendingUpgrade ?? subscription;

  // Auto-select first configured MFS method
  useEffect(() => {
    if (!methods) return;
    const configured = methods.supportedMethods.find((m) =>
      Boolean(methods.receiverNumbers?.[m]),
    );
    if (configured) {
      setPaymentMethod(configured);
    }
  }, [methods]);

  // Sync exact plan price without snap-back bug
  useEffect(() => {
    if (targetSub?.price !== undefined) {
      setPaidAmount(String(Number(targetSub.price)));
    }
  }, [targetSub?.price]);

  if (subQuery.isLoading || methodsQuery.isLoading) {
    return (
      <DashboardShell>
        <LoadingState message="Loading subscription & billing details..." />
      </DashboardShell>
    );
  }

  if (subQuery.isError) {
    return (
      <DashboardShell>
        <ErrorState
          message={getApiErrorMessage(
            subQuery.error,
            "Failed to load subscription",
          )}
          onRetry={() => subQuery.refetch()}
        />
      </DashboardShell>
    );
  }

  const payments = subscription?.payments ?? [];
  const pendingPayment = payments.find((p) => p.status === "PENDING") ?? null;
  const latestRejected =
    !pendingPayment && payments[0]?.status === "REJECTED" ? payments[0] : null;

  const daysRemaining = subscription?.endDate
    ? Math.ceil(
        (new Date(subscription.endDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;
  const studentLimit = subscription?.package?.studentLimit ?? 0;
  const activeStudents = subscription?.activeStudentsCount ?? 0;
  const quotaPct =
    studentLimit > 0
      ? Math.min(100, Math.round((activeStudents / studentLimit) * 100))
      : 0;

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Unable to copy ${label.toLowerCase()}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSub) return;
    const amount = Number(paidAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    try {
      await submitMutation.mutateAsync({
        subscriptionId: targetSub.id,
        payload: {
          paymentMethod,
          senderNumber: senderNumber.trim(),
          receiverNumber:
            methods?.receiverNumbers?.[paymentMethod] ?? undefined,
          trxId: trxId.trim().toUpperCase(),
          paidAmount: amount,
          remarks: remarks.trim() || undefined,
        },
      });
      setSenderNumber("");
      setTrxId("");
      setRemarks("");
    } catch {
      // Handled via mutation onError toast
    }
  };

  const scrollToResubmit = () => {
    if (latestRejected) {
      setPaymentMethod(latestRejected.paymentMethod);
      setSenderNumber(latestRejected.senderNumber);
      setPaidAmount(
        String(Number(targetSub?.price ?? latestRejected.paidAmount)),
      );
    }
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Subscription &amp; Billing Hub
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your plan quota, submit bKash/Nagad/Rocket payments, and
              print verified receipts.
            </p>
          </div>
          <Link
            href="/dashboard/admin/subscription"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Change / Renew Package
          </Link>
        </div>

        {!subscription ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <CreditCard className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <h2 className="text-lg font-semibold">No Subscription Selected</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a subscription package to activate your institution
              workspace.
            </p>
            <Link
              href="/dashboard/admin/subscription"
              className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"
            >
              Browse Packages
            </Link>
          </div>
        ) : (
          <>
            {/* Plan & Quota Overview */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Current Plan
                  </p>
                  <h2 className="mt-1 text-xl font-bold">
                    {subscription.package?.name ??
                      `Package #${subscription.packageId}`}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ৳{Number(subscription.price).toLocaleString()} •{" "}
                    {subscription.package?.billingCycle ?? "MONTHLY"} • Period:{" "}
                    {new Date(subscription.startDate).toLocaleDateString()} –{" "}
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusPillClass(subscription.status)}`}
                  >
                    {subscription.status === "ACTIVE" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : subscription.status === "PENDING" ? (
                      <Clock className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    {subscription.status}
                  </span>
                  {subscription.status === "ACTIVE" && (
                    <span
                      className={`text-xs font-medium ${daysRemaining <= 7 ? "text-amber-600" : "text-muted-foreground"}`}
                    >
                      {daysRemaining > 0
                        ? `${daysRemaining} day(s) remaining`
                        : "Expired — please renew"}
                    </span>
                  )}
                </div>
              </div>

              {studentLimit > 0 && (
                <div className="mt-5 rounded-lg border bg-muted/30 p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      Student Quota Usage
                    </span>
                    <span className="font-semibold">
                      {activeStudents.toLocaleString()} /{" "}
                      {studentLimit.toLocaleString()} ({quotaPct}%)
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${quotaPct >= 90 ? "bg-red-500" : quotaPct >= 75 ? "bg-amber-500" : "bg-primary"}`}
                      style={{ width: `${quotaPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pending Plan Switch Banner */}
            {subscription.pendingUpgrade && (
              <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                <RefreshCw className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                <div>
                  <p className="font-semibold">
                    Package Change Requested:{" "}
                    {subscription.pendingUpgrade.package.name} (৳
                    {Number(subscription.pendingUpgrade.price).toLocaleString()}
                    )
                  </p>
                  <p className="mt-0.5 text-xs text-blue-800">
                    Your current plan remains active until Super Admin verifies
                    your payment for the new package below.
                  </p>
                </div>
              </div>
            )}

            {/* Pending Verification Banner */}
            {pendingPayment && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div className="space-y-1">
                  <p className="font-semibold">
                    Payment Under Super Admin Review
                  </p>
                  <p className="text-xs text-amber-900">
                    Method: <strong>{pendingPayment.paymentMethod}</strong> •
                    Amount:{" "}
                    <strong>
                      ৳{Number(pendingPayment.paidAmount).toLocaleString()}
                    </strong>{" "}
                    • TrxID:{" "}
                    <span className="font-mono font-bold">
                      {pendingPayment.trxId}
                    </span>
                  </p>
                  <p className="text-xs text-amber-800">
                    Submitted on{" "}
                    {new Date(pendingPayment.createdAt).toLocaleString()}.
                    Verification usually completes within 1–2 hours.
                  </p>
                </div>
              </div>
            )}

            {/* Rejected Payment Callout */}
            {latestRejected && (
              <div className="flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <div>
                    <p className="font-semibold">
                      Last Payment Rejected ({latestRejected.paymentMethod} •{" "}
                      <span className="font-mono">{latestRejected.trxId}</span>)
                    </p>
                    <p className="mt-0.5 text-xs text-red-800">
                      Reason:{" "}
                      {latestRejected.rejectionReason ||
                        "Verification failed. Please double-check your TrxID and resubmit."}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={scrollToResubmit}
                >
                  Resubmit Payment
                </Button>
              </div>
            )}

            {/* Guided 3-Step MFS Payment Card */}
            {targetSub &&
              targetSub.status !== "CANCELLED" &&
              !pendingPayment && (
                <div ref={formRef} className="rounded-xl border bg-card p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold">
                        Submit Mobile Banking Payment
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Step 1: Copy receiver number &amp; send ৳
                        {Number(targetSub.price).toLocaleString()} • Step 2:
                        Enter Sender Number &amp; TrxID • Step 3: Submit for
                        verification.
                      </p>
                    </div>
                  </div>

                  {methods && (
                    <div className="mb-6 space-y-3">
                      {methods.paymentInstruction && (
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs leading-5 text-foreground">
                          {methods.paymentInstruction}
                        </div>
                      )}
                      <div className="grid gap-3 sm:grid-cols-3">
                        {methods.supportedMethods.map((m) => {
                          const receiver = methods.receiverNumbers?.[m];
                          const accountType = methods.accountTypes?.[m];
                          return (
                            <div
                              key={m}
                              className={`rounded-xl border p-3.5 text-left transition ${
                                !receiver
                                  ? "opacity-50"
                                  : paymentMethod === m
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "hover:bg-muted/40"
                              }`}
                            >
                              <button
                                type="button"
                                disabled={!receiver}
                                onClick={() => receiver && setPaymentMethod(m)}
                                className="flex w-full items-center justify-between gap-2 text-left disabled:cursor-not-allowed"
                              >
                                <span className="text-sm font-semibold">
                                  {m}
                                </span>
                                {accountType && (
                                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    {ACCOUNT_TYPE_HINT[accountType] ??
                                      accountType}
                                  </span>
                                )}
                              </button>
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <p className="font-mono text-xs font-medium text-foreground">
                                  {receiver ?? "Not configured"}
                                </p>
                                {receiver && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleCopy(receiver, `${m} number`)
                                    }
                                    className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium hover:bg-muted"
                                  >
                                    <Copy className="h-3 w-3" />
                                    Copy
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {methods.supportPhone && (
                        <p className="text-xs text-muted-foreground">
                          Billing Support:{" "}
                          <span className="font-mono font-medium text-foreground">
                            {methods.supportPhone}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="senderNumber">
                          Sender Mobile Number
                        </Label>
                        <Input
                          id="senderNumber"
                          required
                          placeholder="01XXXXXXXXX"
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="trxId">Transaction ID (TrxID)</Label>
                        <Input
                          id="trxId"
                          required
                          placeholder="e.g. 9K2L8M4N5P"
                          className="font-mono uppercase"
                          value={trxId}
                          onChange={(e) =>
                            setTrxId(e.target.value.toUpperCase())
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="paidAmount">
                        Exact Plan Amount (BDT)
                      </Label>
                      <Input
                        id="paidAmount"
                        type="number"
                        min={1}
                        step="0.01"
                        required
                        value={paidAmount}
                        readOnly
                        className="bg-muted/40 font-mono font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="remarks">Remarks (Optional)</Label>
                      <Textarea
                        id="remarks"
                        rows={2}
                        placeholder="Optional note for Super Admin verification"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                    </div>

                    <Button type="submit" disabled={submitMutation.isPending}>
                      {submitMutation.isPending
                        ? "Submitting Payment..."
                        : `Submit ${paymentMethod} Payment (৳${Number(targetSub.price).toLocaleString()})`}
                    </Button>
                  </form>
                </div>
              )}

            {/* Payment History & Printable Receipts */}
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Payment History</h3>
              </div>

              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No subscription payments submitted yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2.5">Date</th>
                        <th className="px-3 py-2.5">Package</th>
                        <th className="px-3 py-2.5">Method / TrxID</th>
                        <th className="px-3 py-2.5">Amount</th>
                        <th className="px-3 py-2.5">Status</th>
                        <th className="px-3 py-2.5 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {payments.map((p) => (
                        <tr key={p.id}>
                          <td className="px-3 py-3 text-xs text-muted-foreground">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-3 font-medium">
                            {p.package?.name ?? "Subscription"}
                          </td>
                          <td className="px-3 py-3">
                            <p className="text-xs font-semibold">
                              {p.paymentMethod}
                            </p>
                            <p className="font-mono text-xs text-muted-foreground">
                              {p.trxId}
                            </p>
                            {p.rejectionReason && (
                              <p className="mt-1 text-xs text-red-600">
                                Rejected: {p.rejectionReason}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-3 font-semibold">
                            ৳{Number(p.paidAmount).toLocaleString()}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${statusPillClass(p.status)}`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            {p.status === "VERIFIED" ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setReceiptPayment(p)}
                                className="h-7 gap-1 px-2.5 text-xs"
                              >
                                <Printer className="h-3 w-3" />
                                Receipt
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Printable Subscription Receipt Modal */}
      <Modal
        open={Boolean(receiptPayment)}
        onClose={() => setReceiptPayment(null)}
        title="Subscription Payment Receipt"
        description={`Official receipt for payment #${receiptPayment?.id ?? ""}`}
      >
        {receiptPayment && (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border bg-muted/20 p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receipt No</span>
                <span className="font-mono font-semibold">
                  SUB-{receiptPayment.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package</span>
                <span className="font-medium">
                  {receiptPayment.package?.name ?? subscription?.package?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">
                  {receiptPayment.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono font-semibold">
                  {receiptPayment.trxId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sender Number</span>
                <span className="font-mono">{receiptPayment.senderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verified At</span>
                <span>
                  {receiptPayment.verifiedAt
                    ? new Date(receiptPayment.verifiedAt).toLocaleString()
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <span>Total Paid</span>
                <span>
                  ৳{Number(receiptPayment.paidAmount).toLocaleString()} BDT
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setReceiptPayment(null)}
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={() => window.print()}
                className="gap-1.5"
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardShell>
  );
}
