"use client";

import {
  ArrowLeft,
  CreditCard,
  CircleX,
} from "lucide-react";
import Link from "next/link";

export default function SubscriptionPaymentCancelledPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border bg-background p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
          <CircleX className="h-9 w-9 text-amber-600" />
        </div>

        <h1 className="mt-6 text-2xl font-bold">
          Payment Cancelled
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          You cancelled the payment process. Your school
          subscription is still waiting for payment.
        </p>

        <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-left">
          <p className="text-sm font-medium">
            Subscription is still pending
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            You can return to the dashboard and try the
            payment again.
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
            Pay Again
          </Link>
        </div>
      </div>
    </div>
  );
}
