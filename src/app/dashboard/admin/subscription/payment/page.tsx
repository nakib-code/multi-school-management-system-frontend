"use client";

import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  useInitiateSubscriptionPayment,
  useRequestCashPayment,
} from "@/features/payments/hooks";
import { useMySubscription } from "@/features/subscriptions/hooks";

const formatPrice = (price: string | number) => {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return String(price);
  }

  return new Intl.NumberFormat("en-BD").format(numericPrice);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function SubscriptionPaymentPage() {
  const router = useRouter();

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

  const [cashRequestSubmitted, setCashRequestSubmitted] =
    useState(false);

  /*
   * If there is no subscription, the Admin has not
   * selected a package yet.
   */
  useEffect(() => {
    if (!isLoading && !isError && !subscription) {
      router.replace("/dashboard/admin/subscription");
    }
  }, [
    isLoading,
    isError,
    subscription,
    router,
  ]);

  /*
   * Online payment
   */
  const handleOnlinePayment = async () => {
    if (!subscription) {
      return;
    }

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

  /*
   * Cash payment
   */
  const handleCashPayment = async () => {
    if (!subscription) {
      return;
    }

    try {
      await cashPaymentMutation.mutateAsync(
        subscription.id,
      );

      setCashRequestSubmitted(true);

      toast.success("Cash payment request submitted", {
        description:
          "Your payment request has been sent to the Super Admin for approval.",
      });

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

  /*
   * Loading
   */
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />

          <p className="text-sm text-muted-foreground">
            Loading subscription...
          </p>
        </div>
      </main>
    );
  }

  /*
   * Error
   */
  if (isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="w-full max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <RefreshCw className="h-6 w-6 text-destructive" />
          </div>

          <h1 className="mt-5 text-xl font-semibold">
            Unable to load subscription
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            We could not load your subscription information.
            Please try again.
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
      </main>
    );
  }

  /*
   * No subscription
   */
  if (!subscription) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />

          <p className="text-sm text-muted-foreground">
            Redirecting to package selection...
          </p>
        </div>
      </main>
    );
  }

  const price = Number(subscription.price);

  const billingLabel =
    subscription.package.billingCycle === "YEARLY"
      ? "year"
      : "month";

  /*
   * ACTIVE subscription
   */
  if (subscription.status === "ACTIVE") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="rounded-2xl border bg-background shadow-sm">
            <div className="border-b p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Subscription Active
                  </h1>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Your school subscription is active.
                    You can now access your admin dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="rounded-xl border bg-muted/30 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Current Package
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  {subscription.package.name}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  ৳{formatPrice(price)} / {billingLabel}
                </p>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-xs text-muted-foreground">
                    Start Date
                  </p>

                  <p className="mt-1 font-medium">
                    {formatDate(subscription.startDate)}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs text-muted-foreground">
                    End Date
                  </p>

                  <p className="mt-1 font-medium">
                    {formatDate(subscription.endDate)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard/admin")
                }
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * CANCELLED / EXPIRED
   *
   * These subscriptions should not be paid directly.
   * Send the Admin back to package selection.
   */
  if (
    subscription.status === "CANCELLED" ||
    subscription.status === "EXPIRED"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <CreditCard className="h-6 w-6 text-destructive" />
          </div>

          <h1 className="mt-5 text-xl font-semibold">
            Subscription {subscription.status}
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your current subscription is no longer active.
            Please choose a new subscription package.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard/admin/subscription")
            }
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <CreditCard className="h-4 w-4" />
            Choose Package
          </button>
        </div>
      </main>
    );
  }

  /*
   * PENDING subscription
   */
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border bg-background shadow-sm">
          {/* Header */}
          <div className="border-b p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Complete Your Subscription
                </h1>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Complete your payment to activate your
                  school subscription.
                </p>
              </div>
            </div>
          </div>

          {/* Selected package */}
          <div className="border-b p-6 sm:p-8">
            <div className="rounded-xl border bg-muted/30 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
                    ৳{formatPrice(price)}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    per {billingLabel}
                  </p>
                </div>
              </div>

              <div className="mt-4 inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700">
                Payment Pending
              </div>
            </div>
          </div>

          {/* Payment methods */}
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-semibold">
              Choose Payment Method
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Select how you want to pay for your subscription.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {/* Online payment */}
              <div className="flex flex-col rounded-xl border p-5 transition hover:border-primary/50">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>

                <h3 className="mt-4 font-semibold">
                  Online Payment
                </h3>

                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                  Pay securely using the available online
                  payment gateway.
                </p>

                <button
                  type="button"
                  onClick={handleOnlinePayment}
                  disabled={onlinePaymentMutation.isPending}
                  className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {onlinePaymentMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Starting Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Pay Online
                    </>
                  )}
                </button>
              </div>

              {/* Cash payment */}
              <div className="flex flex-col rounded-xl border p-5 transition hover:border-amber-500/50">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10">
                  <Banknote className="h-5 w-5 text-amber-600" />
                </div>

                <h3 className="mt-4 font-semibold">
                  Cash Payment
                </h3>

                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                  Pay manually and submit your payment for
                  Super Admin approval.
                </p>

                {!showCashDetails ? (
                  <button
                    type="button"
                    onClick={() =>
                      setShowCashDetails(true)
                    }
                    disabled={cashRequestSubmitted}
                    className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Banknote className="h-4 w-4" />
                    Pay by Cash
                  </button>
                ) : cashRequestSubmitted ? (
                  <div className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                      <div>
                        <p className="text-sm font-medium">
                          Cash Request Submitted
                        </p>

                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          Your cash payment request has been
                          sent to the Super Admin. Your
                          subscription will be activated
                          after approval.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-lg border bg-muted/40 p-4">
                    <p className="text-sm font-medium">
                      Cash Payment Instructions
                    </p>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Contact the Super Admin for the official
                      cash payment details. After completing
                      the payment, submit your payment request
                      below.
                    </p>

                    <button
                      type="button"
                      onClick={handleCashPayment}
                      disabled={
                        cashPaymentMutation.isPending
                      }
                      className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {cashPaymentMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Submitting...
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
              </div>
            </div>

            {/* Activation information */}
            <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-sm font-medium">
                Subscription activation
              </p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Your subscription will become active after
                successful online payment verification or
                Super Admin approval of your cash payment.
              </p>
            </div>

            {/* Change package */}
            <button
              type="button"
              onClick={() =>
                router.push("/dashboard/admin/subscription")
              }
              className="mt-5 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Choose a different package
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}