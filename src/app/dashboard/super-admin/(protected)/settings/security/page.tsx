"use client";

import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePassword } from "@/features/auth/hooks";
import { getApiErrorMessage } from "@/lib/api";

export default function SuperAdminSecuritySettingsPage() {
  const changePasswordMutation = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update password"));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/super-admin/settings"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Security Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your password and keep your platform admin account secure.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border bg-card p-6"
      >
        <div className="flex items-center gap-2 border-b pb-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold">Change Password</h2>
            <p className="text-xs text-muted-foreground">
              Use at least 8 characters including uppercase, lowercase, and a
              number.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="current-password">Current Password</Label>
          <Input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={changePasswordMutation.isPending}
          className="gap-2"
        >
          <KeyRound className="h-4 w-4" />
          {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}
