"use client";

import Link from "next/link";

import { usePackages } from "@/features/super-admin/packages/use-packages";
import { PackageCard } from "./package-card";

export function PackageList() {
  const { data, isLoading, isError, refetch } = usePackages();

  if (isLoading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[420px] animate-pulse rounded-2xl border bg-muted/30"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center">
        <h3 className="font-semibold">Failed to load packages</h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Something went wrong while fetching packages.
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center">
        <h3 className="font-semibold">No packages found</h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Create your first package to get started.
        </p>

        <Link
          href="/dashboard/super-admin/packages/create"
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Create Package
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {data.map((packageData) => (
        <PackageCard
          key={packageData.id}
          packageData={packageData}
        />
      ))}
    </div>
  );
}