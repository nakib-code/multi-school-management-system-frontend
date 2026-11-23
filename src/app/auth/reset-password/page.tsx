"use client";

import { AlertTriangle, ArrowLeft, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, getApiErrorMessage } from "@/lib/api";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [checking, setChecking] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token || token.length < 32) {
      setChecking(false);
      setTokenValid(false);
      return;
    }

    let cancelled = false;
    api
      .post("/auth/verify-reset-token", { token })
      .then(() => {
        if (!cancelled) setTokenValid(true);
      })
      .catch(() => {
        if (!cancelled) setTokenValid(false);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
      toast.success("Password reset successfully!");
      setTimeout(() => router.replace("/auth/login"), 2000);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to reset password"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/auth/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

        <div className="rounded-2xl border bg-background p-6 shadow-sm sm:p-8">
          {checking ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Validating your reset link...
              </p>
            </div>
          ) : done ? (
            <div className="space-y-4 py-4 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <h1 className="text-xl font-bold">Password Updated</h1>
              <p className="text-sm text-muted-foreground">
                Your password has been reset and previous sessions have been invalidated. Redirecting to sign in...
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/login">Sign In Now</Link>
              </Button>
            </div>
          ) : !tokenValid ? (
            <div className="space-y-4 py-4 text-center">
              <AlertTriangle className="mx-auto h-10 w-10 text-destructive" />
              <h1 className="text-xl font-bold">Invalid or Expired Link</h1>
              <p className="text-sm text-muted-foreground">
                This password reset link is invalid, has expired, or has already been used.
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/forgot-password">Request a New Reset Link</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Set New Password
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose a strong password of at least 8 characters.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    minLength={8}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    minLength={8}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full gap-2">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? "Updating Password..." : "Reset Password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
