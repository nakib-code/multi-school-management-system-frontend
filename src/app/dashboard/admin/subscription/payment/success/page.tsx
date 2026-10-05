"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

import { useQueryClient } from "@tanstack/react-query";

import { subscriptionKeys } from "@/features/subscriptions/hooks";

export default function SubscriptionPaymentSuccessPage() {
  const queryClient = useQueryClient();

  const handleContinue = async () => {
    await queryClient.invalidateQueries({
      queryKey: subscriptionKeys.me(),
    });
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border bg-background p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </div>

        <h1 className="mt-6 text-2xl font-bold">
          Payment Successful
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Your subscription payment has been completed
          successfully. Your school subscription is now
          active.
        </p>

        <div className="mt-6 rounded-xl bg-muted/50 p-4 text-left">
          <p className="text-sm font-medium">
            Subscription Activated
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            You can now access your school management
            features from the admin dashboard.
          </p>
        </div>

        <Link
          href="/dashboard/admin"
          onClick={handleContinue}
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Continue to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
