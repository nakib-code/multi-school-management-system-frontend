"use client";

import type { PublicPackage } from "@/features/public/types";
import { Check, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SelectedPackageCardProps {
  package: PublicPackage;
  packages?: PublicPackage[];
}

const formatPrice = (price: string | number) => {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return String(price);
  }

  return new Intl.NumberFormat("en-BD").format(numericPrice);
};

const getBillingLabel = (
  billingCycle: PublicPackage["billingCycle"],
) => {
  switch (billingCycle) {
    case "MONTHLY":
      return "per month";

    case "YEARLY":
      return "per year";

    case "CUSTOM":
      return "custom billing";

    default:
      return "";
  }
};

const formatFeatureName = (feature: string) => {
  return feature
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export function SelectedPackageCard({
  package: pkg,
  packages = [],
}: SelectedPackageCardProps) {
  const router = useRouter();

  const [showPackages, setShowPackages] = useState(false);

  const enabledFeatures = pkg.features
    .filter((feature) => feature.enabled)
    .slice(0, 5);

  const availablePackages = packages.filter(
    (item) => !item.isCustom,
  );

  const handlePackageChange = (packageId: number) => {
    router.replace(`/auth/register?packageId=${packageId}`, {
      scroll: false,
    });

    setShowPackages(false);
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
      {/* Selected Package */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />

            <p className="text-sm font-medium text-primary">
              Selected Package
            </p>
          </div>

          <h2 className="mt-2 text-xl font-semibold">
            {pkg.name}
          </h2>

          {pkg.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {pkg.description}
            </p>
          )}
        </div>

        <div className="shrink-0">
          <p className="text-2xl font-bold">
            ৳{formatPrice(pkg.price)}
          </p>

          <p className="text-right text-xs text-muted-foreground">
            {getBillingLabel(pkg.billingCycle)}
          </p>
        </div>
      </div>

      {/* Package Info */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-background px-3 py-1 text-xs font-medium">
          Up to {pkg.studentLimit.toLocaleString()} students
        </span>

        {enabledFeatures.map((item) => (
          <span
            key={item.feature}
            className="rounded-full bg-background px-3 py-1 text-xs text-muted-foreground"
          >
            {formatFeatureName(item.feature)}
          </span>
        ))}
      </div>

      {/* Change Package */}
      <button
        type="button"
        onClick={() => setShowPackages((value) => !value)}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:opacity-80"
      >
        {showPackages ? "Hide packages" : "Change package"}

        {showPackages ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {/* Package Selector */}
      {showPackages && (
        <div className="mt-4 border-t pt-4">
          <p className="text-sm font-semibold">
            Choose another package
          </p>

          <div className="mt-3 space-y-2">
            {availablePackages.map((item) => {
              const isSelected = item.id === pkg.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePackageChange(item.id)}
                  className={[
                    "flex w-full items-center justify-between rounded-lg border p-3 text-left transition",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/40 hover:bg-muted/40",
                  ].join(" ")}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {item.name}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Up to{" "}
                      {item.studentLimit.toLocaleString()} students
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      ৳{formatPrice(item.price)}
                    </p>

                    <p className="text-[11px] text-muted-foreground">
                      {getBillingLabel(item.billingCycle)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Package */}
          <div className="mt-4 rounded-lg border border-dashed border-primary/30 bg-background p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="size-4 text-primary" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold">
                  Need a custom package?
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Choose your student capacity and the features
                  your school actually needs.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/auth/register/custom")
                  }
                  className="mt-3 text-sm font-medium text-primary hover:underline"
                >
                  Customize your package →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}