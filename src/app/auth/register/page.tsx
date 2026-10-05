"use client";

import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { useCreateSchool } from "@/features/schools/hooks";
import { RegistrationForm } from "@/components/home/registration/registration-form";

function RegisterPageContent() {
  const { mutateAsync: registerSchool } = useCreateSchool();

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-3xl">
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
                  Create your school account and submit it for
                  approval.
                </p>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <RegistrationForm
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

function RegisterPageLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading registration...
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterPageLoading />}>
      <RegisterPageContent />
    </Suspense>
  );
}
