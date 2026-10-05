"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogIn,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useAuth } from "@/providers/auth-provider";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schema";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    user,
    isAuthenticated,
    isLoading,
    login,
  } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const emailFromUrl =
    searchParams.get("email") ?? "";

  const nextFromUrl =
    searchParams.get("next") ??
    searchParams.get("redirect") ??
    "";

  const safeNext =
    nextFromUrl.startsWith("/dashboard/")
      ? nextFromUrl
      : null;

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: emailFromUrl,
      password: "",
    },
  });

  /**
   * Redirect already authenticated users.
   */
  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) {
      return;
    }

    if (safeNext) {
      router.replace(safeNext);
      return;
    }

    const rolePath = user.role
      .toLowerCase()
      .replace("_", "-");

    router.replace(`/dashboard/${rolePath}`);
  }, [
    isLoading,
    isAuthenticated,
    user,
    safeNext,
    router,
  ]);

  const onSubmit = async (
    values: LoginFormValues,
  ) => {
    try {
      await login(values);

      toast.success("Login successful", {
        description:
          "Welcome back. Redirecting...",
      });

      /**
       * Wait for auth state to update.
       * The useEffect above will handle the final
       * redirect using the authenticated user.
       */
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Invalid email or password";

      toast.error("Login failed", {
        description: message,
      });
    }
  };

  if (isLoading || isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking authentication...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-2xl border bg-background shadow-sm">
          {/* Header */}
          <div className="border-b p-6 text-center sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <LogIn className="h-6 w-6 text-primary" />
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sign in to manage your school.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 p-6 sm:p-8"
          >
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium"
              >
                Email
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  {...register("email")}
                  className="h-11 w-full rounded-lg border bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium"
                >
                  Password
                </label>

                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...register("password")}
                  className="h-11 w-full rounded-lg border bg-background pl-10 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current,
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Register */}
          <div className="border-t p-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/#packages"
              className="font-medium text-primary hover:underline"
            >
              Register your school
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function LoginPageLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageLoading />}>
      <LoginPageContent />
    </Suspense>
  );
}
