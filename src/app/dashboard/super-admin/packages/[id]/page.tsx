"use client";

import { PackageDetails } from "@/components/super-admin/package/package-details";
import { PackageForm } from "@/components/super-admin/package/package-form";
import { usePackage } from "@/features/super-admin/packages/use-packages";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

export default function PackageDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = Number(params.id);
  const isEdit = searchParams.get("edit") === "true";

  const {
    data: packageData,
    isLoading,
    isError,
    refetch,
  } = usePackage(id);

  if (isLoading) {
    return (
      <main className="space-y-6 p-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />

        <div className="h-[500px] animate-pulse rounded-2xl border bg-muted/30" />
      </main>
    );
  }

  if (isError || !packageData) {
    return (
      <main className="p-6">
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed text-center">
          <h2 className="font-semibold">
            Package not found
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            We could not load this package.
          </p>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Try Again
            </button>

            <Link
              href="/dashboard/super-admin/packages"
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Back
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6">
      <div>
        <Link
          href="/dashboard/super-admin/packages"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back to Packages
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit
              ? `Edit ${packageData.name}`
              : packageData.name}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {isEdit
              ? "Update package settings and features."
              : "View package details and configuration."}
          </p>
        </div>
      </div>

      {isEdit ? (
        <PackageForm packageData={packageData} />
      ) : (
        <PackageDetails packageData={packageData} />
      )}
    </main>
  );
}