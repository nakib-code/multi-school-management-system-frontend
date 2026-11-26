"use client";

import { CheckCircle2, ClipboardList, XCircle } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  useLeaveRequests,
  useReviewLeaveRequest,
} from "@/features/attendance/hooks";
import type {
  LeaveRequestItem,
  LeaveRequestStatus,
} from "@/features/attendance/types";
import { getApiErrorMessage } from "@/lib/api";
import { formatLocalDateDisplay } from "@/lib/attendance-date";

const LEAVE_BADGE: Record<LeaveRequestStatus, string> = {
  PENDING:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  APPROVED:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  REJECTED:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300",
};

export function LeaveRequestsTab({ schoolId }: { schoolId: number }) {
  const [statusFilter, setStatusFilter] = useState<LeaveRequestStatus | "">(
    "PENDING",
  );
  const [reviewing, setReviewing] = useState<{
    item: LeaveRequestItem;
    decision: "APPROVED" | "REJECTED";
  } | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  const leavesQuery = useLeaveRequests(
    schoolId,
    statusFilter ? { status: statusFilter } : undefined,
    { autoRefresh: true },
  );
  const reviewMut = useReviewLeaveRequest(schoolId);

  const openReview = (
    item: LeaveRequestItem,
    decision: "APPROVED" | "REJECTED",
  ) => {
    setReviewing({ item, decision });
    setReviewNote("");
  };

  const handleConfirmReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewing) return;
    await reviewMut.mutateAsync({
      id: reviewing.item.id,
      status: reviewing.decision,
      ...(reviewNote.trim() ? { reviewNote: reviewNote.trim() } : {}),
    });
    setReviewing(null);
  };

  const items = leavesQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="mobile-filter-bar">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as LeaveRequestStatus | "")
            }
            className="h-10 w-full rounded-[11px] border bg-background px-3 text-sm sm:h-9 sm:w-auto"
          >
            <option value="PENDING">Pending Only</option>
            <option value="">All Requests</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {leavesQuery.isLoading ? (
        <LoadingState message="Loading leave requests..." />
      ) : leavesQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(
            leavesQuery.error,
            "Failed to load leave requests",
          )}
          onRetry={() => leavesQuery.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No leave requests"
          description={
            statusFilter === "PENDING"
              ? "There are no pending leave requests right now."
              : "No leave requests match this filter."
          }
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => {
            const en = item.student.enrollments[0];
            return (
              <div
                key={item.id}
                className="surface-panel flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">
                      {item.student.firstName} {item.student.lastName ?? ""}
                    </span>
                    {en && (
                      <span className="text-xs text-muted-foreground">
                        {en.class.name}
                        {en.section ? ` (${en.section.name})` : ""}
                      </span>
                    )}
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${LEAVE_BADGE[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-foreground">
                    {formatLocalDateDisplay(item.fromDate)} →{" "}
                    {formatLocalDateDisplay(item.toDate)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reason: {item.reason}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Requested by {item.requestedByUser.name}
                    {item.reviewedByUser
                      ? ` • Reviewed by ${item.reviewedByUser.name}`
                      : ""}
                    {item.reviewNote ? ` • Note: ${item.reviewNote}` : ""}
                  </p>
                </div>

                {item.status === "PENDING" && (
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => openReview(item, "APPROVED")}
                      className="min-h-[40px] gap-1.5 rounded-[11px] bg-emerald-600 text-white hover:bg-emerald-700 sm:min-h-0"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openReview(item, "REJECTED")}
                      className="min-h-[40px] gap-1.5 rounded-[11px] border-red-200 text-red-700 hover:bg-red-50 sm:min-h-0"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(reviewing)}
        onClose={() => setReviewing(null)}
        title={
          reviewing?.decision === "APPROVED"
            ? "Approve Leave Request"
            : "Reject Leave Request"
        }
        description={
          reviewing
            ? `${reviewing.item.student.firstName} ${reviewing.item.student.lastName ?? ""} (${formatLocalDateDisplay(reviewing.item.fromDate)} – ${formatLocalDateDisplay(reviewing.item.toDate)})`
            : undefined
        }
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleConfirmReview} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="leave-review-note">Review Note (Optional)</Label>
            <textarea
              id="leave-review-note"
              rows={3}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder={
                reviewing?.decision === "APPROVED"
                  ? "e.g. Approved. Will be prefilled as Excused."
                  : "e.g. Reason for rejection..."
              }
              className="w-full rounded-[11px] border bg-background p-2.5 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReviewing(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={reviewMut.isPending}
              className={
                reviewing?.decision === "REJECTED"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : ""
              }
            >
              {reviewMut.isPending
                ? "Submitting..."
                : reviewing?.decision === "APPROVED"
                  ? "Confirm Approval"
                  : "Confirm Rejection"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
