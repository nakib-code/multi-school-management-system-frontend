"use client";

import Link from "next/link";
import type { Package } from "@/features/super-admin/packages/type";
import { useUpdatePackageStatus } from "@/features/super-admin/packages/use-packages";

interface PackageDetailsProps {
  packageData: Package;
}

export function PackageDetails({ packageData }: PackageDetailsProps) {
  const updateStatus = useUpdatePackageStatus();

  const handleStatusChange = async () => {
    await updateStatus.mutateAsync({
      id: packageData.id,
      isActive: !packageData.isActive,
    });
  };

  const price = Number(packageData.price).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return (
    <div className="space-y-6">
      {/* Overview */}
      <section className="rounded-2xl border bg-card p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">{packageData.name}</h2>

              <span
                className={[
                  "rounded-full px-2.5 py-1 text-xs font-medium",
                  packageData.isActive
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-muted text-muted-foreground",
                ].join(" ")}
              >
                {packageData.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {packageData.description || "No description available."}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/dashboard/super-admin/packages/${packageData.id}?edit=true`}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Edit
            </Link>

            <button
              type="button"
              onClick={handleStatusChange}
              disabled={updateStatus.isPending}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
            >
              {updateStatus.isPending
                ? "Updating..."
                : packageData.isActive
                  ? "Disable"
                  : "Enable"}
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Price</p>

          <p className="mt-2 text-2xl font-bold">৳{price}</p>

          <p className="mt-1 text-xs text-muted-foreground">
            Per {packageData.billingCycle.toLowerCase()}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Student Limit</p>

          <p className="mt-2 text-2xl font-bold">
            {packageData.studentLimit.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Maximum active students
          </p>
        </div>
      </section>

      {/* Metadata */}
      <section className="rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Package Information</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Package ID</p>

            <p className="mt-1 text-sm font-medium">#{packageData.id}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Billing Cycle</p>

            <p className="mt-1 text-sm font-medium">
              {packageData.billingCycle}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Created At</p>

            <p className="mt-1 text-sm font-medium">
              {new Date(packageData.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Last Updated</p>

            <p className="mt-1 text-sm font-medium">
              {new Date(packageData.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
