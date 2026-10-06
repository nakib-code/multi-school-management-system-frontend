"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  GraduationCap,
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

import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schema";
import { useAuth } from "@/providers/auth-provider";

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

  const emailFromUrl = searchParams.get("email") ?? "";

  const nextFromUrl =
    searchParams.get("next") ??
    searchParams.get("redirect") ??
    "";

  const safeNext = nextFromUrl.startsWith("/dashboard/")
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

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values);

      toast.success("Login successful", {
        description: "Welcome back. Redirecting...",
      });

      /**
       * Auth state will update after login.
       * The useEffect above handles the redirect.
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
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-[#00a99d]" />
          Checking authentication...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* ==================================================
            LEFT SIDE
        ================================================== */}
        <section className="relative hidden overflow-hidden bg-[#061842] text-white lg:flex">
          {/* Decorative backgrounds */}
          <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#00d2c4]/10 blur-3xl" />

          <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />

          <div className="pointer-events-none absolute left-[15%] top-[25%] h-3 w-3 rounded-full bg-[#00d2c4]" />

          <div className="pointer-events-none absolute right-[20%] top-[18%] h-4 w-4 rounded-full bg-yellow-300" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-16">
            {/* Brand */}
            <Link
              href="/"
              className="group inline-flex w-fit items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00d2c4] text-[#061842] shadow-lg shadow-cyan-500/20 transition-transform group-hover:scale-105">
                <GraduationCap className="h-6 w-6" />
              </div>

              <div>
                <p className="text-lg font-black tracking-tight">
                  School
                  <span className="text-[#00d2c4]">
                    Hub
                  </span>
                </p>

                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                  Education Platform
                </p>
              </div>
            </Link>

            {/* Main content */}
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00d2c4]/30 bg-[#00d2c4]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#5ff5eb]">
                <LogIn className="h-4 w-4" />
                Welcome Back
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight xl:text-5xl">
                Manage Your School
                <span className="block text-[#00d2c4]">
                  From One Place
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-white/60">
                Sign in to access your dashboard and manage students,
                admissions, teachers, payments, and more.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  "Manage students and admissions",
                  "Track school activities",
                  "Access your dashboard securely",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-white/70"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00d2c4]/10">
                      <span className="h-2 w-2 rounded-full bg-[#00d2c4]" />
                    </div>

                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} SchoolHub. All rights reserved.
            </p>
          </div>
        </section>

        {/* ==================================================
            RIGHT SIDE
        ================================================== */}
        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            {/* Back */}
            <Link
              href="/"
              className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#008f87]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            {/* Card */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
              {/* Header */}
              <div className="border-b border-slate-200 px-6 py-8 text-center sm:px-8">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00d2c4]/10 text-[#008f87]">
                  <LogIn className="h-6 w-6" />
                </div>

                <h2 className="mt-5 text-2xl font-black tracking-tight text-[#061842]">
                  Welcome Back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to continue to your SchoolHub account.
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
                    className="flex items-center gap-1.5 text-sm font-semibold text-[#061842]"
                  >
                    <Mail className="h-4 w-4 text-[#008f87]" />
                    Email
                  </label>

                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="admin@example.com"
                      {...register("email")}
                      className={`${inputClass(
                        !!errors.email,
                      )} pl-10`}
                    />

                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>

                  {errors.email && (
                    <p
                      className="text-xs font-medium text-red-500"
                      role="alert"
                    >
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="flex items-center gap-1.5 text-sm font-semibold text-[#061842]"
                    >
                      <LockKeyhole className="h-4 w-4 text-[#008f87]" />
                      Password
                    </label>

                    <Link
                      href="/auth/forgot-password"
                      className="text-xs font-semibold text-[#008f87] transition hover:text-[#061842] hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      type={
                        showPassword ? "text" : "password"
                      }
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      {...register("password")}
                      className={`${inputClass(
                        !!errors.password,
                      )} pl-10 pr-11`}
                    />

                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current,
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#061842]"
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
                    <p
                      className="text-xs font-medium text-red-500"
                      role="alert"
                    >
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#061842] px-4 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-[#0b285f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Register */}
              <div className="border-t border-slate-200 bg-slate-50 px-6 py-6 text-center text-sm text-slate-500">
                Don&apos;t have a school account?{" "}
                <Link
                  href="/auth/school-register"
                  className="font-semibold text-[#008f87] transition hover:text-[#061842] hover:underline"
                >
                  Register your school
                </Link>
              </div>
            </div>

            {/* Mobile branding */}
            <div className="mt-8 flex items-center justify-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00d2c4] text-[#061842]">
                <GraduationCap className="h-4 w-4" />
              </div>

              <p className="text-sm font-black text-[#061842]">
                School
                <span className="text-[#00a99d]">Hub</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function inputClass(hasError: boolean) {
  return [
    "h-12 w-full rounded-xl border bg-white px-3 text-sm text-[#061842]",
    "outline-none transition",
    "placeholder:text-slate-400",
    "focus:border-[#00d2c4] focus:ring-4 focus:ring-[#00d2c4]/10",
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-400/10"
      : "border-slate-200",
  ].join(" ");
}

function LoginPageLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-[#00a99d]" />
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