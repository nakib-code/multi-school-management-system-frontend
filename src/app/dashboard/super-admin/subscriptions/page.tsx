import SubscriptionList from "@/components/super-admin/subscriptions/subscription-list";

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Subscriptions
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage school subscriptions, packages, and subscription status.
        </p>
      </div>

      <SubscriptionList />
    </div>
  );
}