"use client";

import type { PublicPackage } from "@/features/public/types";
import { Check } from "lucide-react";
import Link from "next/link";

interface PublicPackageCardProps {
  package: PublicPackage;
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
      return "/ month";
    case "YEARLY":
      return "/ year";
    case "CUSTOM":
      return "Custom";
    default:
      return "";
  }
};

export function PublicPackageCard({
  package: pkg,
}: PublicPackageCardProps) {
  const enabledFeatures = pkg.features.filter(
    (feature) => feature.enabled,
  );

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div>
        <h3 className="text-xl font-semibold">{pkg.name}</h3>

        {pkg.description && (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {pkg.description}
          </p>
        )}
      </div>

      <div className="mt-6">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold">
            ৳{formatPrice(pkg.price)}
          </span>

          <span className="mb-1 text-sm text-muted-foreground">
            {getBillingLabel(pkg.billingCycle)}
          </span>
        </div>

        <p className="mt-2 text-sm font-medium">
          Up to {pkg.studentLimit.toLocaleString()} students
        </p>
      </div>

      <div className="my-6 h-px bg-border" />

      <ul className="flex flex-1 flex-col gap-3">
        {enabledFeatures.map((item) => (
          <li
            key={item.feature}
            className="flex items-start gap-2 text-sm text-muted-foreground"
          >
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />

            <span>
              {item.feature
                .replaceAll("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase())}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={`/auth/register?packageId=${pkg.id}`}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Choose {pkg.name}
      </Link>
    </div>
  );
}
