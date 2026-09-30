"use client";

import { Package } from "@/features/super-admin/packages/type";
import { useUpdatePackageStatus } from "@/features/super-admin/packages/use-packages";
import Link from "next/link";
import { useState } from "react";


interface PackageCardProps {
  packageData: Package;
}

export function PackageCard({
  packageData,
}: PackageCardProps) {
  const updateStatus = useUpdatePackageStatus();

  const [showConfirm, setShowConfirm] = useState(false);

  const handleStatusChange = async () => {
    try {
      await updateStatus.mutateAsync({
        id: packageData.id,
        isActive: !packageData.isActive,
      });

      setShowConfirm(false);
    } catch {
      // Global API error handler can handle the error.
    }
  };

  const enabledFeatures = packageData.features.filter(
    (feature) => feature.enabled,
  );

  const formattedPrice = Number(packageData.price).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  );

  return (
    <div className="group relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Top */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              {packageData.name}
            </h2>

            {packageData.isCustom && (
              <span className="rounded-full bg-purple-500/10 px-2 py-1 text-[10px] font-semibold text-purple-600">
                Custom
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {packageData.description ||
              "No description available."}
          </p>
        </div>

        <span
          className={[
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
            packageData.isActive
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-muted text-muted-foreground",
          ].join(" ")}
        >
          {packageData.isActive
            ? "Active"
            : "Inactive"}
        </span>
      </div>

      {/* Price */}
      <div className="mt-6">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold tracking-tight">
            ৳{formattedPrice}
          </span>

          <span className="mb-1 text-sm text-muted-foreground">
            /{" "}
            {packageData.billingCycle.toLowerCase()}
          </span>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Up to{" "}
          <span className="font-semibold text-foreground">
            {packageData.studentLimit.toLocaleString()}
          </span>{" "}
          students
        </p>
      </div>

      {/* Features */}
      <div className="mt-6 flex-1">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">
            Features
          </p>

          <span className="text-xs text-muted-foreground">
            {enabledFeatures.length} included
          </span>
        </div>

        <div className="space-y-2">
          {enabledFeatures
            .slice(0, 6)
            .map((feature) => (
              <div
                key={feature.id}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] text-emerald-600">
                  ✓
                </span>

                <span>
                  {feature.feature
                    .replaceAll("_", " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (char) =>
                      char.toUpperCase(),
                    )}
                </span>
              </div>
            ))}

          {enabledFeatures.length > 6 && (
            <p className="pt-1 text-xs text-muted-foreground">
              +{enabledFeatures.length - 6} more features
            </p>
          )}

          {enabledFeatures.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No features configured.
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-2 border-t pt-5">
        <Link
          href={`/super-admin/packages/${packageData.id}`}
          className="flex-1 rounded-lg border px-3 py-2 text-center text-sm font-medium transition hover:bg-muted"
        >
          Details
        </Link>

        <Link
          href={`/super-admin/packages/${packageData.id}?edit=true`}
          className="flex-1 rounded-lg bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Edit
        </Link>

        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted"
        >
          {packageData.isActive
            ? "Disable"
            : "Enable"}
        </button>
      </div>

      {/* Confirmation */}
      {showConfirm && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/95 p-6 backdrop-blur-sm">
          <div className="w-full max-w-xs text-center">
            <h3 className="font-semibold">
              {packageData.isActive
                ? "Disable this package?"
                : "Enable this package?"}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              {packageData.isActive
                ? "Schools will no longer be able to use this package for new subscriptions."
                : "This package will become available again."}
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={updateStatus.isPending}
                className="flex-1 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStatusChange}
                disabled={updateStatus.isPending}
                className="flex-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {updateStatus.isPending
                  ? "Updating..."
                  : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}