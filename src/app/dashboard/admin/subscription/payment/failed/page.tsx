"use client";

import { ArrowLeft, CreditCard, XCircle } from "lucide-react";
import Link from "next/link";

export default function SubscriptionPaymentFailedPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border bg-background p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-9 w-9 text-destructive" />
        </div>

        <h1 className="mt-6 text-2xl font-bold">
          Payment Failed
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          We could not complete your subscription payment.
          Your subscription has not been activated.
        </p>

        <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-left">
          <p className="text-sm font-medium text-destructive">
            Payment was not completed
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Please try again or use another payment method.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard/admin"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border bg-background px-5 text-sm font-medium transition hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            href="/dashboard/admin"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <CreditCard className="h-4 w-4" />
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}
