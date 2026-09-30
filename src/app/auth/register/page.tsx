"use client";

import {
  ArrowLeft,
  Building2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { usePublicPackages } from "@/features/public/use-public-packages";
import { useCreateSchool } from "@/features/schools/hooks";
import { SelectedPackageCard } from "@/components/home/registration/selected-package-card";
import { RegistrationForm } from "@/components/home/registration/registration-form";


export default function RegisterPage() {
  const searchParams = useSearchParams();

  const packageIdParam =
    searchParams.get("packageId");

  const packageId = packageIdParam
    ? Number(packageIdParam)
    : undefined;

  const {
    data: packages,
    isLoading: isPackagesLoading,
  } = usePublicPackages();

  const { mutateAsync: registerSchool } =
    useCreateSchool();

  // ------------------------------------------------
  // PACKAGE ID VALIDATION
  // ------------------------------------------------

  if (
    !packageId ||
    !Number.isInteger(packageId) ||
    packageId <= 0
  ) {
    return (
      <PackageError
        title="Please select a package"
        description="Please choose a package before registering your school."
      />
    );
  }

  // ------------------------------------------------
  // PACKAGE LOADING
  // ------------------------------------------------

  if (isPackagesLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading package...
        </div>
      </main>
    );
  }

  // ------------------------------------------------
  // SELECTED PACKAGE
  // ------------------------------------------------

  const selectedPackage = packages?.find(
    (pkg) => pkg.id === packageId,
  );

  // ------------------------------------------------
  // INVALID PACKAGE
  // ------------------------------------------------

  if (!selectedPackage) {
    return (
      <PackageError
        title="Package not available"
        description="The selected package is no longer available. Please choose another package."
      />
    );
  }

  // ------------------------------------------------
  // PAGE
  // ------------------------------------------------

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-3xl">
        {/* Back */}

        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-2xl border bg-background shadow-sm">
          {/* Header */}

          <div className="border-b p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Register your school
                </h1>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Create your school account and start
                  managing everything from one platform.
                </p>
              </div>
            </div>
          </div>

          {/* Selected Package */}

          <div className="border-b p-6 sm:p-8">
            <SelectedPackageCard
              package={selectedPackage}
            />
          </div>

          {/* Registration Form */}

          <RegistrationForm
            packageId={packageId}
            selectedPackage={selectedPackage}
            registerSchool={registerSchool}
          />

          {/* Login */}

          <div className="border-t p-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}

            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

interface PackageErrorProps {
  title: string;
  description: string;
}

function PackageError({
  title,
  description,
}: PackageErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
          <Building2 className="h-5 w-5 text-destructive" />
        </div>

        <h1 className="mt-5 text-xl font-semibold">
          {title}
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>

        <Link
          href="/#packages"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          View Packages
        </Link>
      </div>
    </main>
  );
}