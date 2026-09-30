"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  GraduationCap,
  Loader2,
  Package,
  XCircle,
} from "lucide-react";
import { useCustomPackageRequest, useReviewCustomPackageRequest } from "@/features/super-admin/custom-package-requests/use-custom-package-requests";


interface CustomPackageRequestDetailsProps {
  id: number;
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-500/10 text-yellow-600";

    case "APPROVED":
      return "bg-green-500/10 text-green-600";

    case "REJECTED":
      return "bg-red-500/10 text-red-600";

    case "CANCELLED":
      return "bg-muted text-muted-foreground";

    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function CustomPackageRequestDetails({
  id,
}: CustomPackageRequestDetailsProps) {
  const { data, isLoading, isError } =
    useCustomPackageRequest(id);

  const reviewMutation =
    useReviewCustomPackageRequest();

  const [reviewNote, setReviewNote] = useState("");

  const handleReview = (
    status: "APPROVED" | "REJECTED",
  ) => {
    reviewMutation.mutate({
      id,
      payload: {
        status,
        ...(reviewNote.trim() && {
          reviewNote: reviewNote.trim(),
        }),
      },
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
          Request not found
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          The custom package request could not be loaded.
        </p>

        <Link
          href="/dashboard/super-admin/custom-package-requests"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to requests
        </Link>
      </div>
    );
  }

  const isPending = data.status === "PENDING";

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/super-admin/custom-package-requests"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to requests
      </Link>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Custom Package Request
            </h1>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                data.status,
              )}`}
            >
              {data.status}
            </span>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Request #{data.id}
          </p>
        </div>

        {isPending && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={reviewMutation.isPending}
              onClick={() => handleReview("APPROVED")}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reviewMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}

              Approve
            </button>

            <button
              type="button"
              disabled={reviewMutation.isPending}
              onClick={() => handleReview("REJECTED")}
              className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {reviewMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <XCircle className="size-4" />
              )}

              Reject
            </button>
          </div>
        )}
      </div>

      {/* Main Information */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Request Information */}
        <div className="rounded-xl border bg-card p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <ClipboardList className="size-5 text-primary" />

            <h2 className="font-semibold">
              Request Information
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <InfoItem
              label="Student Limit"
              value={data.requestedStudentLimit.toLocaleString()}
            />

            <InfoItem
              label="Requested Price"
              value={`${data.requestedPrice}`}
            />

            <InfoItem
              label="Billing Cycle"
              value={data.billingCycle}
            />

            <InfoItem
              label="Status"
              value={data.status}
            />

            <InfoItem
              label="Requested At"
              value={formatDate(data.createdAt)}
            />

            {data.reviewedAt && (
              <InfoItem
                label="Reviewed At"
                value={formatDate(data.reviewedAt)}
              />
            )}
          </div>
        </div>

        {/* School */}
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

      {/* Features */}
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <Package className="size-5 text-primary" />

          <div>
            <h2 className="font-semibold">
              Requested Features
            </h2>

            <p className="text-sm text-muted-foreground">
              {data.features.length} features requested
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.features.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3"
            >
              <CheckCircle2 className="size-4 shrink-0 text-green-600" />

              <span className="text-sm">
                {formatFeatureName(item.feature)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      {data.description && (
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-3 flex items-center gap-3">
            <GraduationCap className="size-5 text-primary" />

            <h2 className="font-semibold">
              School Description
            </h2>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {data.description}
          </p>
        </div>
      )}

      {/* Review Section */}
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <CalendarDays className="size-5 text-primary" />

          <div>
            <h2 className="font-semibold">
              Review
            </h2>

            <p className="text-sm text-muted-foreground">
              Add a note before approving or rejecting this request.
            </p>
          </div>
        </div>

        {isPending ? (
          <div className="space-y-4">
            <textarea
              value={reviewNote}
              onChange={(event) =>
                setReviewNote(event.target.value)
              }
              placeholder="Write a review note..."
              rows={4}
              maxLength={2000}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <div className="text-right text-xs text-muted-foreground">
              {reviewNote.length}/2000
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-muted/30 p-4">
            {data.reviewNote ? (
              <p className="whitespace-pre-wrap text-sm leading-6">
                {data.reviewNote}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No review note was added.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Request Metadata */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <DollarSign className="size-3.5" />
          Request ID: {data.id}
        </span>

        <span>
          Created: {formatDate(data.createdAt)}
        </span>

        <span>
          Updated: {formatDate(data.updatedAt)}
        </span>
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

function formatFeatureName(feature: string) {
  return feature
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}