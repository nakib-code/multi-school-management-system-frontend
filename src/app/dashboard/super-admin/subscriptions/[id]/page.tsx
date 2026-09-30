"use client";

import SubscriptionDetails from "@/components/super-admin/subscriptions/subscription-details";
import { useParams } from "next/navigation";


export default function SubscriptionDetailsPage() {
  const params = useParams();

  const id = Number(params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return (
      <div className="rounded-xl border p-10 text-center">
        <h2 className="font-semibold">
          Invalid subscription ID
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Please provide a valid subscription ID.
        </p>
      </div>
    );
  }

  return <SubscriptionDetails id={id} />;
}