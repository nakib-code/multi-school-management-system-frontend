"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { useMySubscription } from "@/features/subscriptions/hooks";

export default function AdminProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const {
    data: subscription,
    isLoading,
    isError,
  } = useMySubscription();

  useEffect(() => {
    if (isLoading || isError) {
      return;
    }

    // No subscription
    if (!subscription) {
      router.replace("/dashboard/admin/subscription");
      return;
    }

    // Only ACTIVE subscription can access
    // the Admin dashboard.
    if (subscription.status !== "ACTIVE") {
      router.replace("/dashboard/admin/subscription");
    }
  }, [isLoading, isError, subscription, router]);

  // Checking subscription
  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />

          <p className="text-sm text-muted-foreground">
            Checking your subscription...
          </p>
        </div>
      </main>
    );
  }

  // Subscription API error
  if (isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            Unable to check your subscription.
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  // No subscription
  if (!subscription) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />

          <p className="text-sm text-muted-foreground">
            Redirecting to subscription...
          </p>
        </div>
      </main>
    );
  }

  // Subscription is not active
  if (subscription.status !== "ACTIVE") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />

          <p className="text-sm text-muted-foreground">
            Redirecting to subscription...
          </p>
        </div>
      </main>
    );
  }

  // ACTIVE subscription
  // Admin can access the full dashboard.
  return <DashboardShell>{children}</DashboardShell>;
}