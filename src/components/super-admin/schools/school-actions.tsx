"use client";

import {
  Check,
  MoreHorizontal,
  ShieldBan,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import type { School } from "@/types/school";

interface SchoolActionsProps {
  school: School;
  loading?: boolean;
  onApprove?: (school: School) => void;
  onBlock?: (school: School) => void;
  onUnblock?: (school: School) => void;
  onReject?: (school: School) => void;
  onDelete?: (school: School) => void;
}

export function SchoolActions({
  school,
  loading = false,
  onApprove,
  onBlock,
  onUnblock,
  onReject,
  onDelete,
}: SchoolActionsProps) {
  const disabled = loading;

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Approve */}
      {school.status === "PENDING" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onApprove?.(school)}
          title="Approve school"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-green-600 transition hover:bg-green-50 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-green-500/10"
        >
          <Check className="h-4 w-4" />
          <span className="sr-only">
            Approve school
          </span>
        </button>
      )}

      {/* Block */}
      {school.status === "ACTIVE" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onBlock?.(school)}
          title="Block school"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-red-500/10"
        >
          <ShieldBan className="h-4 w-4" />
          <span className="sr-only">
            Block school
          </span>
        </button>
      )}

      {/* Unblock */}
      {school.status === "BLOCKED" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onUnblock?.(school)}
          title="Unblock school"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-green-600 transition hover:bg-green-50 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-green-500/10"
        >
          <ShieldCheck className="h-4 w-4" />
          <span className="sr-only">
            Unblock school
          </span>
        </button>
      )}

      {/* Reject */}
      {school.status === "PENDING" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onReject?.(school)}
          title="Reject school"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-orange-600 transition hover:bg-orange-50 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-orange-500/10"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">
            Reject school
          </span>
        </button>
      )}

      {/* Delete */}
      {school.status === "REJECTED" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete?.(school)}
          title="Delete school"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">
            Delete school
          </span>
        </button>
      )}

      {/* No action */}
      {school.status !== "PENDING" &&
        school.status !== "ACTIVE" &&
        school.status !== "BLOCKED" &&
        school.status !== "REJECTED" && (
          <span className="text-muted-foreground">
            —
          </span>
        )}
    </div>
  );
}
