import { PublicPackage } from "@/features/public/types";
import { Check } from "lucide-react";
import Link from "next/link";

interface SelectedPackageCardProps {
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
}: SelectedPackageCardProps) {
  const enabledFeatures = pkg.features
    .filter((feature) => feature.enabled)
    .slice(0, 5);

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
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

      <Link
        href="/#packages"
        className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
      >
        Change package
      </Link>
    </div>
  );
}