"use client";

import { CreditCard } from "lucide-react";

export default function SubscriptionList() {
  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center gap-3 border-b p-5">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
          <CreditCard className="size-5 text-primary" />
        </div>

        <div>
          <h2 className="font-semibold">Subscriptions</h2>
          <p className="text-sm text-muted-foreground">
            Manage school subscriptions and package assignments.
          </p>
        </div>
      </div>

      <div className="p-8 text-center">
        <CreditCard className="mx-auto mb-3 size-10 text-muted-foreground" />

        <h3 className="font-medium">No subscriptions loaded</h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Subscription data will appear here once the API is connected.
        </p>
      </div>
    </div>
  );
}