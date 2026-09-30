"use client";

import { usePublicPackages } from "@/features/public/use-public-packages";
import { PublicPackageCard } from "./public-package-card";

export function PublicPackageList() {
  const { data: packages, isLoading, isError } = usePublicPackages();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-[480px] animate-pulse rounded-2xl border border-border bg-muted/40"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">
          Failed to load packages. Please try again later.
        </p>
      </div>
    );
  }

  if (!packages?.length) {
    return (
      <div className="rounded-xl border border-border p-8 text-center">
        <p className="text-muted-foreground">
          No packages are currently available.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => (
        <PublicPackageCard key={pkg.id} package={pkg} />
      ))}
    </div>
  );
}