"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { useVerifyAdminEmail } from "@/features/schools/hooks";
import {
  verifyAdminEmailSchema,
  VerifyEmailAdminFormValues,
} from "@/features/schools/schema";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { mutateAsync: verifyEmail } = useVerifyAdminEmail();

  const emailFromUrl = searchParams.get("email") ?? "";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailAdminFormValues>({
    resolver: zodResolver(verifyAdminEmailSchema),
    defaultValues: {
      email: emailFromUrl,
      code: "",
    },
  });

  useEffect(() => {
    if (emailFromUrl) {
      setValue("email", emailFromUrl);
      return;
    }

    const savedEmail = sessionStorage.getItem("schoolRegistrationEmail");

    if (savedEmail) {
      setValue("email", savedEmail);
    }
  }, [emailFromUrl, setValue]);

const onSubmit = async (
  values: VerifyEmailAdminFormValues,
) => {
  try {
    const result = await verifyEmail(values);

    const adminEmail =
      result?.adminEmail ?? values.email;

    sessionStorage.setItem(
      "schoolRegistrationEmail",
      adminEmail,
    );

    toast.success("Email verified successfully", {
      description:
        "Your email has been verified. Please login to continue with payment.",
    });

    router.push(
      `/auth/login?email=${encodeURIComponent(adminEmail)}&next=/dashboard/admin/subscription/payment`,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Invalid or expired verification code";

    toast.error("Verification failed", {
      description: message,
    });
  }
};

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/auth/register"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to registration
        </Link>

        <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <MailCheck className="h-6 w-6 text-primary" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight">
              Verify your email
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              We sent a 6-digit verification code to your admin email address.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Admin Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                {...register("email")}
                className={inputClass(!!errors.email)}
              />

              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Verification Code */}
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Verification Code
              </label>

              <input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="Enter 6-digit code"
                {...register("code")}
                className={`${inputClass(
                  !!errors.code,
                )} text-center text-lg tracking-[0.35em]`}
              />

              {errors.code && (
                <p className="text-xs text-destructive">
                  {errors.code.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}

              {isSubmitting ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div className="mt-6 border-t pt-6 text-center">
            <p className="text-xs leading-5 text-muted-foreground">
              Didn&apos;t receive the code? Please check your spam folder or
              make sure the email address is correct.
            </p>

            <Link
              href="/auth/register"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              Register again
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function VerifyEmailLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading verification...
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailForm />
    </Suspense>
  );
}

function inputClass(hasError: boolean) {
  return `h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
    hasError ? "border-destructive" : ""
  }`;
}
