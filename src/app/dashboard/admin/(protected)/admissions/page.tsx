"use client";

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  useAdmissions,
  useApproveAdmission,
  useConfirmCashPayment,
  useRejectAdmission,
} from "@/features/admissions/hooks";
import { useAuth } from "@/providers/auth-provider";
import type {
  AdmissionStatus,
  AdmissionPaymentStatus,
} from "@/features/admissions/types";

const PAGE_SIZE = 10;

export default function AdminAdmissionsPage() {
  const { user } = useAuth();

  const schoolId = user?.schoolId ?? 0;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AdmissionStatus | "">("");
  const [paymentStatus, setPaymentStatus] =
    useState<AdmissionPaymentStatus | "">("");
  const [page, setPage] = useState(1);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useAdmissions(schoolId, {
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    status: status || undefined,
    paymentStatus: paymentStatus || undefined,
  });

  const approveMutation = useApproveAdmission(schoolId);
  const rejectMutation = useRejectAdmission(schoolId);
  const cashPaymentMutation = useConfirmCashPayment(schoolId);

  const admissions = data?.admissions ?? [];
  const meta = data?.meta;

  function applySearch() {
    setSearch(searchInput.trim());
    setPage(1);
  }

  async function handleApprove(admissionId: number) {
    if (!window.confirm("Approve this admission application?")) return;

    try {
      await approveMutation.mutateAsync(admissionId);
      toast.success("Admission approved successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to approve admission",
      );
    }
  }

  async function handleCashPayment(admissionId: number) {
    if (!window.confirm("Confirm that the admission fee was received in cash?")) {
      return;
    }

    try {
      await cashPaymentMutation.mutateAsync({
        admissionId,
        input: { remarks: "Cash payment confirmed by admin" },
      });
      toast.success("Cash payment confirmed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to confirm payment",
      );
    }
  }

  async function handleReject() {
    if (!rejectId) return;

    const reason = rejectionReason.trim();

    if (!reason) {
      toast.error("Please enter a rejection reason");
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        admissionId: rejectId,
        input: { rejectionReason: reason },
      });

      toast.success("Admission rejected successfully");
      setRejectId(null);
      setRejectionReason("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reject admission",
      );
    }
  }

  if (!schoolId) {
    return (
      <div className="rounded-xl border p-6 text-sm text-muted-foreground">
        Your account is not associated with a school.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review applications, verify payments, and manage admission decisions.
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <form
          className="relative min-w-0 flex-1 sm:max-w-sm"
          onSubmit={(event) => {
            event.preventDefault();
            applySearch();
          }}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search application, name, email..."
            className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </form>

        <button
          type="button"
          onClick={applySearch}
          className="h-10 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
        >
          Search
        </button>

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as AdmissionStatus | "");
            setPage(1);
          }}
          className="h-10 rounded-lg border bg-background px-3 text-sm"
          aria-label="Filter by admission status"
        >
          <option value="">All admission statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select
          value={paymentStatus}
          onChange={(event) => {
            setPaymentStatus(
              event.target.value as AdmissionPaymentStatus | "",
            );
            setPage(1);
          }}
          className="h-10 rounded-lg border bg-background px-3 text-sm"
          aria-label="Filter by payment status"
        >
          <option value="">All payment statuses</option>
          <option value="PENDING">Payment pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Rejection form */}
      {rejectId !== null && (
        <div className="space-y-3 rounded-xl border bg-background p-4">
          <h2 className="font-semibold">Reject admission</h2>
          <p className="text-sm text-muted-foreground">
            Enter the reason that will be recorded for this application.
          </p>

          <textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Rejection reason..."
            rows={3}
            className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={rejectMutation.isPending}
              onClick={handleReject}
              className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Confirm rejection"}
            </button>

            <button
              type="button"
              onClick={() => {
                setRejectId(null);
                setRejectionReason("");
              }}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Admissions table */}
      <div className="overflow-hidden rounded-xl border bg-background">
        {isLoading ? (
          <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading admissions...
          </div>
        ) : isError ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="text-sm text-muted-foreground">
              Failed to load admissions.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        ) : admissions.length === 0 ? (
          <div className="flex min-h-56 items-center justify-center p-6 text-sm text-muted-foreground">
            No admission applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Application</th>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Class</th>
                  <th className="px-4 py-3 font-medium">Admission</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Applied on</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {admissions.map((admission) => {
                  const isPending = admission.status === "PENDING";
                  const paymentIsPaid = admission.payment?.status === "PAID";
                  const isCash = admission.payment?.paymentMethod === "CASH";

                  return (
                    <tr key={admission.id} className="align-top hover:bg-muted/20">
                      <td className="px-4 py-4">
                        <p className="font-medium">{admission.applicationNo}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          ID: {admission.id}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium">{admission.studentName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {admission.studentEmail}
                        </p>
                        {admission.guardianPhone && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {admission.guardianPhone}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <p>{admission.class.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {admission.academicYear}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={admission.status} />
                        {!admission.studentEmailVerified && (
                          <p className="mt-1 text-xs text-amber-600">
                            Email not verified
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {admission.payment ? (
                          <>
                            <StatusBadge status={admission.payment.status} />
                            <p className="mt-1 text-xs text-muted-foreground">
                              {admission.payment.amount.toLocaleString()} ·{" "}
                              {admission.payment.paymentMethod}
                            </p>
                          </>
                        ) : (
                          <span className="text-muted-foreground">No payment</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-muted-foreground">
                        {new Date(admission.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex min-w-36 flex-col items-start gap-2">
                          {isPending && isCash && !paymentIsPaid && (
                            <button
                              type="button"
                              disabled={cashPaymentMutation.isPending}
                              onClick={() => handleCashPayment(admission.id)}
                              className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                            >
                              Confirm cash
                            </button>
                          )}

                          {isPending && paymentIsPaid && (
                            <button
                              type="button"
                              disabled={approveMutation.isPending}
                              onClick={() => handleApprove(admission.id)}
                              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}

                          {isPending && (
                            <button
                              type="button"
                              onClick={() => {
                                setRejectId(admission.id);
                                setRejectionReason("");
                              }}
                              className="rounded-md border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5"
                            >
                              Reject
                            </button>
                          )}

                          {!isPending && (
                            <span className="text-xs text-muted-foreground">
                              No actions available
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 0 && (
          <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages} · {meta.total} applications
              {isFetching ? " · Updating..." : ""}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((current) => current - 1)}
                className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <button
                type="button"
                disabled={
                  !meta ||
                  page >= meta.totalPages ||
                  isFetching
                }
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: AdmissionStatus | AdmissionPaymentStatus;
}) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-500/10 text-amber-700",
    APPROVED: "bg-green-500/10 text-green-700",
    PAID: "bg-green-500/10 text-green-700",
    REJECTED: "bg-red-500/10 text-red-700",
    FAILED: "bg-red-500/10 text-red-700",
    CANCELLED: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}
