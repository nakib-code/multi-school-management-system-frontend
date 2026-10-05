"use client";

import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  Package,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  useInitiateSubscriptionPayment,
  useRequestCashPayment,
} from "@/features/payments/hooks";
import { useMySubscription } from "@/features/subscriptions/hooks";

export function SubscriptionPaymentCard() {
  const {
    data: subscription,
    isLoading,
    isError,
    refetch,
  } = useMySubscription();

  const onlinePaymentMutation =
    useInitiateSubscriptionPayment();

  const cashPaymentMutation =
    useRequestCashPayment();

  const [showCashDetails, setShowCashDetails] =
    useState(false);

  const handlePayOnline = async () => {
    if (!subscription) return;

    try {
      await onlinePaymentMutation.mutateAsync(
        subscription.id,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to start payment.";

      toast.error("Payment initialization failed", {
        description: message,
      });
    }
  };

  const handleCashPayment = async () => {
    if (!subscription) return;

    try {
      await cashPaymentMutation.mutateAsync(
        subscription.id,
      );

      toast.success("Cash payment request submitted", {
        description:
          "Your payment request has been sent to the Super Admin for approval.",
      });

      setShowCashDetails(false);

      await refetch();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to submit cash payment request.";

      toast.error("Cash payment request failed", {
        description: message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-background p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />

          <p className="text-sm text-muted-foreground">
            Loading subscription...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-start gap-3">
          <RefreshCw className="mt-0.5 h-5 w-5 text-destructive" />

          <div>
            <p className="font-semibold text-destructive">
              Failed to load subscription
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              We could not load your subscription information.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="rounded-2xl border bg-background p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>

        <h2 className="mt-4 text-lg font-semibold">
          No subscription found
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Your school does not have a subscription yet.
        </p>
      </div>
    );
  }

  const price = Number(subscription.price);

  const billingLabel =
    subscription.package.billingCycle === "YEARLY"
      ? "year"
      : "month";

  if (subscription.status === "ACTIVE") {
    return (
      <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
        <div className="border-b p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">
                    Subscription Active
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Your school subscription is currently active.
                  </p>
                </div>

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="rounded-xl border bg-muted/30 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current Package
            </p>

            <h3 className="mt-2 text-xl font-semibold">
              {subscription.package.name}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              ৳{price.toLocaleString("en-BD")} / {billingLabel}
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-4">
              <p className="text-xs text-muted-foreground">
                Start Date
              </p>

              <p className="mt-1 font-medium">
                {new Date(
                  subscription.startDate,
                ).toLocaleDateString("en-BD")}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-xs text-muted-foreground">
                End Date
              </p>

              <p className="mt-1 font-medium">
                {new Date(
                  subscription.endDate,
                ).toLocaleDateString("en-BD")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isPending =
    subscription.status === "PENDING";

  const isCancelled =
    subscription.status === "CANCELLED";

  const isExpired =
    subscription.status === "EXPIRED";

  return (
    <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
      <div className="border-b p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Complete Your Subscription
            </h1>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Choose a payment method to activate your
              school subscription.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Package */}
        <div className="rounded-xl border bg-muted/30 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Selected Package
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                {subscription.package.name}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Billed {billingLabel}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-2xl font-bold">
                ৳{price.toLocaleString("en-BD")}
              </p>

              <p className="text-xs text-muted-foreground">
                per {billingLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        {isCancelled && (
          <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm font-semibold text-destructive">
              Previous payment was cancelled
            </p>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              You can start a new payment to activate your
              subscription.
            </p>
          </div>
        )}

        {isExpired && (
          <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-sm font-semibold">
              Subscription expired
            </p>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Complete a payment to continue using the
              subscription.
            </p>
          </div>
        )}

        {/* Payment Methods */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold">
            Choose Payment Method
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Select how you want to pay.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {/* Online */}
            <div className="rounded-xl border p-5 transition hover:border-primary/50 hover:shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>

              <h3 className="mt-4 font-semibold">
                Online Payment
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Pay securely through the online payment
                gateway.
              </p>

              <button
                type="button"
                onClick={handlePayOnline}
                disabled={
                  onlinePaymentMutation.isPending ||
                  cashPaymentMutation.isPending ||
                  !isPending
                }
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {onlinePaymentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Pay Online
                  </>
                )}
              </button>
            </div>

            {/* Cash */}
            <div className="rounded-xl border p-5 transition hover:border-primary/50 hover:shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10">
                <Banknote className="h-5 w-5 text-amber-600" />
              </div>

              <h3 className="mt-4 font-semibold">
                Cash Payment
              </h3>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Pay manually and submit your payment for
                Super Admin approval.
              </p>

              {isPending && !showCashDetails && (
                <button
                  type="button"
                  onClick={() =>
                    setShowCashDetails(true)
                  }
                  disabled={
                    onlinePaymentMutation.isPending ||
                    cashPaymentMutation.isPending
                  }
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Banknote className="h-4 w-4" />
                  Pay by Cash
                </button>
              )}

              {isPending && showCashDetails && (
                <div className="mt-5 rounded-xl border bg-muted/30 p-4">
                  <p className="text-sm font-semibold">
                    Cash Payment Instructions
                  </p>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Contact the Super Admin for the official
                    cash payment details. After completing
                    the payment, submit your payment request.
                  </p>

                  <div className="mt-4 rounded-lg bg-background p-4">
                    <p className="text-xs text-muted-foreground">
                      Payment Amount
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      ৳{price.toLocaleString("en-BD")}
                    </p>

                    <p className="mt-3 text-xs text-muted-foreground">
                      Cash Payment Number
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      Payment details will be provided by the
                      Super Admin.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCashPayment}
                    disabled={
                      cashPaymentMutation.isPending
                    }
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {cashPaymentMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        I've Paid by Cash
                      </>
                    )}
                  </button>
                </div>
              )}

              {!isPending && (
                <div className="mt-5 rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Cash payment is unavailable for the
                    current subscription status.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activation Info */}
        <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-semibold">
            Subscription activation
          </p>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Your subscription becomes active after successful
            online payment verification or Super Admin approval
            of your cash payment.
          </p>
        </div>
      </div>
    </div>
  );
}
