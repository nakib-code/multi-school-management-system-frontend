"use client";

import {
  Check,
  CreditCard,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { usePublicPackages } from "@/features/public/use-public-packages";
import { useSelectPackage } from "@/features/subscriptions/hooks";

const formatPrice = (price: string | number) => {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return String(price);
  }

  return new Intl.NumberFormat("en-BD").format(numericPrice);
};

const getBillingLabel = (
  billingCycle: "MONTHLY" | "YEARLY" | "CUSTOM",
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

const formatFeatureName = (feature: string) => {
  return feature
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function AdminSubscriptionPage() {
  const router = useRouter();

  const {
    data: packages,
    isLoading,
    isError,
    refetch,
  } = usePublicPackages();

  const selectPackageMutation = useSelectPackage();

  const [selectedPackageId, setSelectedPackageId] =
    useState<number | null>(null);

  const handleSelectPackage = async (packageId: number) => {
    setSelectedPackageId(packageId);

    try {
      await selectPackageMutation.mutateAsync(packageId);

      toast.success("Package selected", {
        description:
          "Your subscription has been created. Please complete the payment.",
      });

      router.push("/dashboard/admin/subscription/payment");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to select this package.";

      toast.error("Package selection failed", {
        description: message,
      });

      setSelectedPackageId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading packages...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <RefreshCw className="h-6 w-6 text-destructive" />
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            Failed to load packages
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            We could not load the available subscription packages.
            Please try again.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!packages?.length) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center justify-center px-4">
        <div className="w-full rounded-2xl border bg-background p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <CreditCard className="h-6 w-6 text-muted-foreground" />
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            No packages available
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            There are currently no subscription packages available.
            Please contact the Super Admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <CreditCard className="h-6 w-6 text-primary" />
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Choose Your Subscription
        </h1>

        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Select the package that best fits your school. You can
          complete the payment after choosing a package.
        </p>
      </div>

      {/* Packages */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => {
          const isSelecting =
            selectPackageMutation.isPending &&
            selectedPackageId === pkg.id;

          const enabledFeatures = pkg.features.filter(
            (feature) => feature.enabled,
          );

          return (
            <div
              key={pkg.id}
              className="flex h-full flex-col rounded-2xl border bg-background p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Package Info */}
              <div>
                <h2 className="text-xl font-semibold">
                  {pkg.name}
                </h2>

                {pkg.description && (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {pkg.description}
                  </p>
                )}
              </div>

              {/* Price */}
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
                  Up to {pkg.studentLimit.toLocaleString("en-BD")} students
                </p>
              </div>

              <div className="my-6 h-px bg-border" />

              {/* Features */}
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  Included Features
                </p>

                {enabledFeatures.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {enabledFeatures.map((item) => (
                      <li
                        key={item.feature}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        </span>

                        <span>
                          {formatFeatureName(item.feature)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    No additional features listed.
                  </p>
                )}
              </div>

              {/* Select */}
              <button
                type="button"
                onClick={() => handleSelectPackage(pkg.id)}
                disabled={selectPackageMutation.isPending}
                className="mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSelecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Selecting...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Select {pkg.name}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom Package Note */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
        <p className="text-sm font-semibold">
          Need a custom package?
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Contact the Super Admin for a custom package based on
          your school&apos;s requirements.
        </p>
      </div>
    </div>
  );
}
