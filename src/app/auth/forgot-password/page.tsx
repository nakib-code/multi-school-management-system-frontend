"use client";

import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, getApiErrorMessage } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSubmitted(true);
      toast.success("Password reset instructions sent if the account exists.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to request password reset"));
    } finally {
      setIsSubmitting(false);
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
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {submitted ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : (
                <Mail className="h-6 w-6" />
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {submitted ? "Check your email" : "Forgot Password"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {submitted
                ? "If an active account matches that email, we sent a secure reset link valid for 30 minutes."
                : "Enter your account email and we will send you a password reset link."}
            </p>
          </div>

          {submitted ? (
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/auth/login">Return to Sign In</Link>
              </Button>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="w-full text-center text-xs font-medium text-primary hover:underline"
              >
                Try another email address
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Sending link..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
