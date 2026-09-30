"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Loader2,
  Package,
  XCircle,
} from "lucide-react";
import { useSubscription, useUpdateSubscriptionStatus } from "@/features/super-admin/subscriptions/use-subscriptions";



interface SubscriptionDetailsProps {
  id: number;
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

export default function SubscriptionDetails({
  id,
}: SubscriptionDetailsProps) {
  const { data, isLoading, isError } = useSubscription(id);

  const updateStatus = useUpdateSubscriptionStatus();

  const handleStatusChange = (
    status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING",
  ) => {
    updateStatus.mutate({
      id,
      status,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="size-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border p-10 text-center">
        <XCircle className="mx-auto mb-3 size-10 text-destructive" />

        <h2 className="font-semibold">
          Subscription not found
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          The subscription could not be loaded.
        </p>

        <Link
          href="/dashboard/super-admin/subscriptions"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to subscriptions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/super-admin/subscriptions"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to subscriptions
      </Link>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Subscription Details
          </h1>

          <p className="text-sm text-muted-foreground">
            Subscription #{data.id}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {data.status !== "ACTIVE" && (
            <button
              type="button"
              disabled={updateStatus.isPending}
              onClick={() => handleStatusChange("ACTIVE")}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {updateStatus.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}

              Activate
            </button>
          )}

          {data.status === "ACTIVE" && (
            <button
              type="button"
              disabled={updateStatus.isPending}
              onClick={() => handleStatusChange("CANCELLED")}
              className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              {updateStatus.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <XCircle className="size-4" />
              )}

              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <Package className="size-5 text-primary" />

            <h2 className="font-semibold">
              Package Information
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <InfoItem
              label="Package"
              value={data.package.name}
            />

            <InfoItem
              label="Billing Cycle"
              value={data.package.billingCycle}
            />

            <InfoItem
              label="Price"
              value={`${data.price}`}
            />

            <InfoItem
              label="Student Limit"
              value={data.package.studentLimit.toLocaleString()}
            />

            <InfoItem
              label="Package Type"
              value={data.package.isCustom ? "Custom" : "Standard"}
            />

            <InfoItem
              label="Package Status"
              value={data.package.isActive ? "Active" : "Inactive"}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <Building2 className="size-5 text-primary" />

            <h2 className="font-semibold">
              School
            </h2>
          </div>

          <div className="space-y-4">
            <InfoItem
              label="School Name"
              value={data.school.name}
            />

            <InfoItem
              label="School Code"
              value={data.school.code}
            />

            <InfoItem
              label="School Status"
              value={data.school.status}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <CalendarDays className="size-5 text-primary" />

          <h2 className="font-semibold">
            Subscription Period
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Start Date"
            value={formatDate(data.startDate)}
          />

          <InfoItem
            label="End Date"
            value={formatDate(data.endDate)}
          />

          <InfoItem
            label="Status"
            value={data.status}
          />

          <InfoItem
            label="Created At"
            value={formatDate(data.createdAt)}
          />
        </div>
      </div>

      {data.notes && (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-3 font-semibold">
            Notes
          </h2>

          <p className="text-sm leading-6 text-muted-foreground">
            {data.notes}
          </p>
        </div>
      )}

      <div className="rounded-xl border bg-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <GraduationCap className="size-5 text-primary" />

          <h2 className="font-semibold">
            Subscription Summary
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Students Allowed"
            value={data.package.studentLimit.toLocaleString()}
          />

          <SummaryCard
            label="Subscription Price"
            value={`${data.price}`}
          />

          <SummaryCard
            label="Billing"
            value={data.package.billingCycle}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CreditCard className="size-4" />
        Last updated: {formatDate(data.updatedAt)}
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 font-medium">
        {value}
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold">
        {value}
      </p>
    </div>
  );
}