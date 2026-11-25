"use client";

import { CheckCircle2, CreditCard, Smartphone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
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
import { getApiErrorMessage } from "@/lib/api";

export default function AdminSubscriptionPaymentPage() {
  const subQuery = useMySubscription();
  const methodsQuery = usePaymentMethods();
  const submitMutation = useSubmitSubscriptionPayment();

  const [paymentMethod, setPaymentMethod] =
    useState<MobilePaymentMethod>("BKASH");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [remarks, setRemarks] = useState("");

  if (subQuery.isLoading || methodsQuery.isLoading) {
    return (
      <DashboardShell>
        <LoadingState message="Loading subscription details..." />
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

  const subscription = subQuery.data;
  const methods = methodsQuery.data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscription) return;
    const amount = Number(paidAmount || subscription.price);
    await submitMutation.mutateAsync({
      subscriptionId: subscription.id,
      payload: {
        paymentMethod,
        senderNumber: senderNumber.trim(),
        receiverNumber: methods?.receiverNumbers?.[paymentMethod] ?? undefined,
        trxId: trxId.trim(),
        paidAmount: amount,
        remarks: remarks.trim() || undefined,
      },
    });
    setSenderNumber("");
    setTrxId("");
    setRemarks("");
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Subscription &amp; Billing
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your active package and submit manual bKash, Nagad, or
              Rocket payments.
            </p>
          </div>
          <Link
            href="/dashboard/admin/subscription"
            className="inline-flex h-9 items-center rounded-lg border px-4 text-sm font-medium hover:bg-muted"
          >
            Change Package
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
            <div className="rounded-xl border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">
                    Current Plan
                  </p>
                  <h2 className="mt-1 text-xl font-bold">
                    {subscription.package?.name ??
                      `Package #${subscription.packageId}`}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    ৳{Number(subscription.price).toLocaleString()} •{" "}
                    {subscription.package?.billingCycle ?? "MONTHLY"} • Up to{" "}
                    {subscription.package?.studentLimit ?? "—"} students
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {subscription.status}
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Period: {new Date(subscription.startDate).toLocaleDateString()}{" "}
                – {new Date(subscription.endDate).toLocaleDateString()}
              </p>
            </div>

            {subscription.status !== "CANCELLED" && (
              <div className="rounded-xl border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Submit Manual Mobile Banking Payment
                  </h3>
                </div>

                {methods && (
                  <div className="mb-6 space-y-3">
                    {methods.paymentInstruction && (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs leading-5 text-foreground">
                        {methods.paymentInstruction}
                      </div>
                    )}
                    <div className="grid gap-3 sm:grid-cols-3">
                      {methods.supportedMethods.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`rounded-xl border p-3 text-left transition ${
                            paymentMethod === m
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold">{m}</p>
                            {methods.accountTypes?.[m] && (
                              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {methods.accountTypes[m]}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 font-mono text-xs text-muted-foreground">
                            {methods.receiverNumbers[m] ?? "Contact support"}
                          </p>
                        </button>
                      ))}
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
                      <Label htmlFor="senderNumber">Sender Mobile Number</Label>
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
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="paidAmount">Paid Amount (BDT)</Label>
                    <Input
                      id="paidAmount"
                      type="number"
                      min={1}
                      step="0.01"
                      required
                      value={paidAmount || String(subscription.price)}
                      onChange={(e) => setPaidAmount(e.target.value)}
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
                      : `Submit ${paymentMethod} Payment`}
                  </Button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  );
}
