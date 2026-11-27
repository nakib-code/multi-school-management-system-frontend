"use client";

import { Eye, EyeOff, KeyRound, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePassword } from "@/features/auth/hooks";
import { getApiErrorMessage } from "@/lib/api";

interface ChangePasswordModalProps {
  open: boolean;
  onClose?: () => void;
  forced?: boolean;
}

const STRONG_PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,100}$/;

export function ChangePasswordModal({
  open,
  onClose,
  forced = false,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const changeMut = useChangePassword();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!STRONG_PASSWORD_RE.test(newPassword)) {
      toast.error(
        "New password must be at least 8 characters with an uppercase letter, a lowercase letter, and a number.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from your current password.");
      return;
    }

    try {
      await changeMut.mutateAsync({ currentPassword, newPassword });
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to change password"));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      {!forced && (
        <button
          type="button"
          aria-label="Close password dialog"
          onClick={() => onClose?.()}
          className="fixed inset-0 cursor-default"
        />
      )}
      <div className="safe-bottom relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-[18px] border bg-background p-4 shadow-xl sm:rounded-[11px] sm:p-6">
        <div className="mb-4 flex items-start gap-3 border-b pb-3.5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] ${
              forced
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                : "bg-primary/10 text-primary"
            }`}
          >
            {forced ? (
              <ShieldAlert className="h-5 w-5" />
            ) : (
              <KeyRound className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              {forced ? "Set Your Personal Password" : "Change Password"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {forced
                ? "You are signed in with a temporary password. Please set a new private password to continue."
                : "Update your account password. Use at least 8 characters with uppercase, lowercase, and a number."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <Label htmlFor="cp-current" className="text-xs">
              {forced ? "Temporary / Current Password *" : "Current Password *"}
            </Label>
            <Input
              id="cp-current"
              type={showPasswords ? "text" : "password"}
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-11 rounded-[11px] sm:h-10"
              placeholder="Enter current password"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="cp-new" className="text-xs">
              New Password *
            </Label>
            <Input
              id="cp-new"
              type={showPasswords ? "text" : "password"}
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-11 rounded-[11px] sm:h-10"
              placeholder="At least 8 chars (A-Z, a-z, 0-9)"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="cp-confirm" className="text-xs">
              Confirm New Password *
            </Label>
            <Input
              id="cp-confirm"
              type={showPasswords ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 rounded-[11px] sm:h-10"
              placeholder="Re-enter new password"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowPasswords((v) => !v)}
            className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {showPasswords ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            {showPasswords ? "Hide passwords" : "Show passwords"}
          </button>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            {!forced && (
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="min-h-[44px] rounded-[11px] sm:min-h-0"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={changeMut.isPending}
              className="min-h-[44px] rounded-[11px] sm:min-h-0"
            >
              {changeMut.isPending ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
