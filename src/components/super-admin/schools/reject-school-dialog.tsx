"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

import type { School } from "@/types/school";

interface RejectSchoolDialogProps {
  open: boolean;
  school: School | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (rejectionReason: string) => void;
}

export function RejectSchoolDialog({
  open,
  school,
  loading = false,
  onClose,
  onConfirm,
}: RejectSchoolDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open, school]);

  if (!open || !school) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      return;
    }

    onConfirm(trimmedReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-school-title"
        className="w-full max-w-md rounded-xl border bg-background p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="reject-school-title"
              className="text-lg font-semibold"
            >
              Reject School
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Rejecting{" "}
              <span className="font-medium text-foreground">
                {school.name}
              </span>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="rejectionReason"
              className="text-sm font-medium"
            >
              Rejection Reason
            </label>

            <textarea
              id="rejectionReason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Enter the reason for rejecting this school..."
              rows={5}
              disabled={loading}
              className="w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {loading ? "Rejecting..." : "Reject School"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
