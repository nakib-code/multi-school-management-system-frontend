"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SubscriptionPaymentCard() {
  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="text-lg font-semibold">Subscription Payment</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Submit your manual bKash, Nagad, or Rocket transaction ID to activate or renew your plan.
      </p>
      <div className="mt-4">
        <Button asChild>
          <Link href="/dashboard/admin/subscription/payment">
            Go to Subscription Billing
          </Link>
        </Button>
      </div>
    </div>
  );
}
