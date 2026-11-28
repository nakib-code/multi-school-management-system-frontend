"use client";

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  FileDown,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/modals/modal";
import {
  type GuardianCredentialsData,
  GuardianCredentialsModal,
} from "@/components/school-modules/guardian-credentials-modal";
import { useClasses } from "@/features/admin/classes/hooks";
import {
  useAdmissionDetails,
  useAdmissions,
  useApproveAdmission,
  useConfirmCashPayment,
  useRejectAdmission,
  useRejectOnlineAdmissionPayment,
  useVerifyOnlineAdmissionPayment,
} from "@/features/admissions/hooks";
import type {
  AdmissionPaymentStatus,
  AdmissionStatus,
} from "@/features/admissions/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/providers/auth-provider";

const PAGE_SIZE = 10;

function isSafeHttpUrl(url?: string | null): url is string {
  return Boolean(url && /^https?:\/\//i.test(url.trim()));
}

export default function AdminAdmissionsPage() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [classIdFilter, setClassIdFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [status, setStatus] = useState<AdmissionStatus | "">("");
  const [paymentStatus, setPaymentStatus] = useState<
    AdmissionPaymentStatus | ""
  >("");
  const [page, setPage] = useState(1);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "cash" | "verifyOnline";
    admissionId: number;
    trxId?: string | null;
  } | null>(null);
  const [rejectPaymentTarget, setRejectPaymentTarget] = useState<{
    admissionId: number;
    trxId?: string | null;
  } | null>(null);
  const [rejectPaymentReason, setRejectPaymentReason] = useState("");
  const [guardianCredentials, setGuardianCredentials] =
    useState<GuardianCredentialsData | null>(null);

  const debouncedAcademicYear = useDebounce(academicYearFilter.trim(), 350);
  const queryAcademicYear =
    debouncedAcademicYear.length >= 4 ? debouncedAcademicYear : undefined;

  const { data: classes = [] } = useClasses(schoolId);

  const { data, isLoading, isError, isFetching, refetch } = useAdmissions(
    schoolId,
    {
      page,
      limit: PAGE_SIZE,
      search: search || undefined,
      classId: classIdFilter ? Number(classIdFilter) : undefined,
      academicYear: queryAcademicYear,
      status: status || undefined,
      paymentStatus: paymentStatus || undefined,
    },
  );

  const detailQuery = useAdmissionDetails(schoolId, detailId ?? 0);

  const approveMutation = useApproveAdmission(schoolId);
  const rejectMutation = useRejectAdmission(schoolId);
  const cashPaymentMutation = useConfirmCashPayment(schoolId);
  const verifyOnlineMutation = useVerifyOnlineAdmissionPayment(schoolId);
  const rejectOnlineMutation = useRejectOnlineAdmissionPayment(schoolId);

  const admissions = data?.admissions ?? [];
  const meta = data?.meta;

  function applySearch() {
    setSearch(searchInput.trim());
    setPage(1);
  }

  function handleApprove(admissionId: number) {
    setConfirmAction({ type: "approve", admissionId });
  }

  function handleCashPayment(admissionId: number) {
    setConfirmAction({ type: "cash", admissionId });
  }

  function handleVerifyOnlinePayment(
    admissionId: number,
    trxId?: string | null,
  ) {
    setConfirmAction({ type: "verifyOnline", admissionId, trxId });
  }

  function handleRejectOnlinePayment(
    admissionId: number,
    trxId?: string | null,
  ) {
    setRejectPaymentReason("");
    setRejectPaymentTarget({ admissionId, trxId });
  }

  async function executeConfirmAction() {
    if (!confirmAction) return;
    const { type, admissionId } = confirmAction;

    try {
      if (type === "approve") {
        const approved = await approveMutation.mutateAsync(admissionId);
        toast.success(
          "Admission approved — Student, Enrollment & Guardian created",
        );
        setDetailId(null);
        if (approved.guardian?.temporaryPassword) {
          setGuardianCredentials({
            name: approved.guardian.name,
            phone: approved.guardian.phone,
            temporaryPassword: approved.guardian.temporaryPassword,
            studentName: approved.studentName,
          });
        }
      } else if (type === "cash") {
        await cashPaymentMutation.mutateAsync({
          admissionId,
          input: { remarks: "Cash payment confirmed by staff" },
        });
        toast.success("Cash payment confirmed");
      } else if (type === "verifyOnline") {
        await verifyOnlineMutation.mutateAsync({
          admissionId,
          input: { remarks: "Online TrxID verified by staff" },
        });
        toast.success("Online payment verified");
      }
      setConfirmAction(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Action failed. Please retry.",
      );
    }
  }

  async function executeRejectOnlinePayment() {
    if (!rejectPaymentTarget) return;
    const reason = rejectPaymentReason.trim();
    if (reason.length < 3) {
      toast.error(
        "Please enter at least 3 characters for the rejection reason",
      );
      return;
    }

    try {
      await rejectOnlineMutation.mutateAsync({
        admissionId: rejectPaymentTarget.admissionId,
        input: { remarks: reason },
      });
      toast.success("Online payment rejected — applicant can resubmit TrxID");
      setRejectPaymentTarget(null);
      setRejectPaymentReason("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reject payment",
      );
    }
  }

  async function handleReject() {
    if (!rejectId) return;

    const reason = rejectionReason.trim();
    if (reason.length < 5) {
      toast.error("Please enter a rejection reason of at least 5 characters");
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
      setDetailId(null);
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

  const detail = detailQuery.data;

  const reportsBasePath =
    user?.role === "MANAGER"
      ? "/dashboard/manager/reports"
      : "/dashboard/admin/reports";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admissions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inspect applications, verify payments, and approve into Student +
            Enrollment + Guardian records.
          </p>
        </div>
        <Link
          href={`${reportsBasePath}?tab=admissions`}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border bg-background px-3.5 text-sm font-medium hover:bg-muted"
        >
          <FileDown className="h-4 w-4 text-primary" />
          Class Chart / Export PDF
        </Link>
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
            placeholder="Search application, student, phone..."
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
          value={classIdFilter}
          onChange={(event) => {
            setClassIdFilter(event.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border bg-background px-3 text-sm"
          aria-label="Filter by class"
        >
          <option value="">All classes</option>
          {classes.map((cls) => (
            <option key={cls.id} value={String(cls.id)}>
              {cls.name}
            </option>
          ))}
        </select>

        <input
          value={academicYearFilter}
          onChange={(event) => {
            setAcademicYearFilter(event.target.value);
            setPage(1);
          }}
          placeholder="Year (e.g. 2026)"
          aria-label="Filter by academic year"
          className="h-10 w-32 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary"
        />

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
            setPaymentStatus(event.target.value as AdmissionPaymentStatus | "");
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
          <>
            {/* Mobile Admission Cards */}
            <div className="space-y-2.5 p-3 md:hidden">
              {admissions.map((admission) => {
                const isPending = admission.status === "PENDING";
                const hasPaidOrNoFee =
                  !admission.payment ||
                  admission.payment.amount <= 0 ||
                  admission.payment.status === "PAID";
                const isCash = admission.payment?.paymentMethod === "CASH";

                return (
                  <div key={admission.id} className="mobile-card space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {admission.studentName}
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {admission.applicationNo}
                        </p>
                      </div>
                      <StatusBadge status={admission.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="block text-[10px] uppercase">
                          Class
                        </span>
                        <span className="font-medium text-foreground">
                          {admission.class.name}
                          {admission.section
                            ? ` • ${admission.section.name}`
                            : ""}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase">
                          Guardian
                        </span>
                        <span className="font-medium text-foreground">
                          {admission.guardianPhone ??
                            admission.guardianName ??
                            "—"}
                        </span>
                      </div>
                    </div>

                    {admission.payment && admission.payment.amount > 0 && (
                      <div className="rounded-lg border bg-muted/30 p-2.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">
                            {admission.payment.paymentMethod} · ৳
                            {Number(admission.payment.amount).toLocaleString()}
                          </span>
                          <PaymentBadge status={admission.payment.status} />
                        </div>
                        {admission.payment.transactionId && (
                          <p className="mt-1 font-mono text-[11px] text-foreground">
                            TrxID: {admission.payment.transactionId}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 border-t pt-2.5">
                      <button
                        type="button"
                        onClick={() => setDetailId(admission.id)}
                        className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1 rounded-[11px] border px-3 text-xs font-medium hover:bg-muted"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Details
                      </button>

                      {isPending &&
                        isCash &&
                        admission.payment?.status !== "PAID" && (
                          <button
                            type="button"
                            disabled={cashPaymentMutation.isPending}
                            onClick={() => handleCashPayment(admission.id)}
                            className="min-h-[40px] flex-1 rounded-[11px] border px-3 text-xs font-medium hover:bg-muted disabled:opacity-50"
                          >
                            Confirm Cash
                          </button>
                        )}

                      {isPending &&
                        !isCash &&
                        admission.payment &&
                        admission.payment.amount > 0 &&
                        admission.payment.status === "PENDING" &&
                        admission.payment.transactionId && (
                          <>
                            <button
                              type="button"
                              disabled={verifyOnlineMutation.isPending}
                              onClick={() =>
                                handleVerifyOnlinePayment(
                                  admission.id,
                                  admission.payment?.transactionId,
                                )
                              }
                              className="min-h-[40px] flex-1 rounded-[11px] bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Verify TrxID
                            </button>
                            <button
                              type="button"
                              disabled={rejectOnlineMutation.isPending}
                              onClick={() =>
                                handleRejectOnlinePayment(
                                  admission.id,
                                  admission.payment?.transactionId,
                                )
                              }
                              className="min-h-[40px] rounded-[11px] border border-amber-300 bg-amber-50 px-3 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                            >
                              Reject TrxID
                            </button>
                          </>
                        )}

                      {isPending && hasPaidOrNoFee && (
                        <button
                          type="button"
                          disabled={approveMutation.isPending}
                          onClick={() => handleApprove(admission.id)}
                          className="min-h-[40px] flex-1 rounded-[11px] bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-50"
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
                          className="min-h-[40px] rounded-[11px] border border-destructive/30 px-3 text-xs font-medium text-destructive hover:bg-destructive/5"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Admissions Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Application</th>
                    <th className="px-4 py-3 font-medium">
                      Student &amp; Guardian
                    </th>
                    <th className="px-4 py-3 font-medium">Class &amp; Type</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Payment</th>
                    <th className="px-4 py-3 font-medium">Applied on</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {admissions.map((admission) => {
                    const isPending = admission.status === "PENDING";
                    const hasPaidOrNoFee =
                      !admission.payment ||
                      admission.payment.amount <= 0 ||
                      admission.payment.status === "PAID";
                    const isCash = admission.payment?.paymentMethod === "CASH";

                    return (
                      <tr
                        key={admission.id}
                        className="align-top hover:bg-muted/20"
                      >
                        <td className="px-4 py-4">
                          <p className="font-medium">
                            {admission.applicationNo}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            ID: {admission.id}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium">{admission.studentName}</p>
                          {admission.guardianName && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Guardian: {admission.guardianName}
                            </p>
                          )}
                          {admission.guardianPhone && (
                            <p className="text-xs text-muted-foreground">
                              {admission.guardianPhone}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <p>
                            {admission.class.name}
                            {admission.section
                              ? ` • ${admission.section.name}`
                              : ""}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {admission.academicYear}
                            {admission.residentialType
                              ? ` • ${admission.residentialType.replace("_", " ")}`
                              : ""}
                            {admission.quranWing
                              ? ` • ${admission.quranWing}`
                              : ""}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge status={admission.status} />
                        </td>

                        <td className="px-4 py-4">
                          {admission.payment ? (
                            <>
                              <StatusBadge status={admission.payment.status} />
                              <p className="mt-1 text-xs text-muted-foreground">
                                {admission.payment.amount.toLocaleString()} ·{" "}
                                {admission.payment.paymentMethod}
                              </p>
                              {admission.payment.transactionId && (
                                <p className="mt-0.5 font-mono text-[11px] text-foreground">
                                  TrxID: {admission.payment.transactionId}
                                </p>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No upfront fee
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4 text-muted-foreground">
                          {new Date(admission.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex min-w-36 flex-col items-start gap-2">
                            <button
                              type="button"
                              onClick={() => setDetailId(admission.id)}
                              className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Details
                            </button>

                            {isPending &&
                              isCash &&
                              admission.payment?.status !== "PAID" && (
                                <button
                                  type="button"
                                  disabled={cashPaymentMutation.isPending}
                                  onClick={() =>
                                    handleCashPayment(admission.id)
                                  }
                                  className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                                >
                                  Confirm cash
                                </button>
                              )}

                            {isPending &&
                              !isCash &&
                              admission.payment &&
                              admission.payment.amount > 0 &&
                              admission.payment.status === "PENDING" &&
                              Boolean(admission.payment.transactionId) && (
                                <>
                                  <button
                                    type="button"
                                    disabled={verifyOnlineMutation.isPending}
                                    onClick={() =>
                                      handleVerifyOnlinePayment(
                                        admission.id,
                                        admission.payment?.transactionId,
                                      )
                                    }
                                    className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                                  >
                                    Verify TrxID
                                  </button>
                                  <button
                                    type="button"
                                    disabled={rejectOnlineMutation.isPending}
                                    onClick={() =>
                                      handleRejectOnlinePayment(
                                        admission.id,
                                        admission.payment?.transactionId,
                                      )
                                    }
                                    className="rounded-md border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                                  >
                                    Reject TrxID
                                  </button>
                                </>
                              )}

                            {isPending && hasPaidOrNoFee && (
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
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
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
                disabled={!meta || page >= meta.totalPages || isFetching}
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

      {/* Admission Detail Modal */}
      <Modal
        open={detailId !== null}
        onClose={() => setDetailId(null)}
        title={
          detail
            ? `Admission ${detail.applicationNo}`
            : "Admission Application Details"
        }
        maxWidthClass="max-w-3xl"
      >
        {detailQuery.isLoading ? (
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading full details...
          </div>
        ) : detail ? (
          <div className="max-h-[75vh] space-y-6 overflow-y-auto pr-1 text-sm">
            <div className="grid gap-4 rounded-xl border bg-muted/20 p-4 sm:grid-cols-3">
              <DetailItem label="Student Name" value={detail.studentName} />
              <DetailItem label="Bangla Name" value={detail.nameBangla} />
              <DetailItem
                label="Date of Birth"
                value={
                  detail.dateOfBirth
                    ? new Date(detail.dateOfBirth).toLocaleDateString()
                    : null
                }
              />
              <DetailItem label="Gender" value={detail.gender} />
              <DetailItem label="Blood Group" value={detail.bloodGroup} />
              <DetailItem label="Birth Reg No." value={detail.birthRegNo} />
              <DetailItem
                label="Residential Type"
                value={detail.residentialType?.replace("_", " ")}
              />
              <DetailItem
                label="Class / Section"
                value={`${detail.class.name}${detail.section ? ` (${detail.section.name})` : ""}`}
              />
              <DetailItem
                label="Session / Shift"
                value={`${detail.academicYear} · ${detail.shift ?? "MORNING"}`}
              />
              <DetailItem
                label="Academic Group"
                value={detail.academicGroup ?? detail.group}
              />
              <DetailItem label="Quran / Hefz Wing" value={detail.quranWing} />
              <DetailItem
                label="Previous School"
                value={
                  detail.previousSchool
                    ? `${detail.previousSchool}${detail.previousClass ? ` (${detail.previousClass})` : ""}`
                    : null
                }
              />
            </div>

            <div className="grid gap-4 rounded-xl border p-4 sm:grid-cols-3">
              <DetailItem label="Guardian Name" value={detail.guardianName} />
              <DetailItem label="Guardian Phone" value={detail.guardianPhone} />
              <DetailItem
                label="Relationship"
                value={detail.guardianRelationship}
              />
              <DetailItem label="Guardian Email" value={detail.guardianEmail} />
              <DetailItem label="Guardian NID" value={detail.guardianNid} />
              <DetailItem
                label="Occupation"
                value={detail.guardianOccupation}
              />
              <DetailItem label="Father Name" value={detail.fatherName} />
              <DetailItem label="Mother Name" value={detail.motherName} />
              <DetailItem
                label="Present Address"
                value={detail.presentAddress ?? detail.address}
              />
            </div>

            {/* Uploaded Documents */}
            <div className="space-y-3 rounded-xl border p-4">
              <h3 className="font-semibold">Uploaded Documents</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Student Photo", url: detail.studentPhotoUrl },
                  {
                    label: "Birth Certificate",
                    url: detail.birthCertificateUrl,
                  },
                  { label: "Guardian NID", url: detail.guardianNidUrl },
                  {
                    label: "Previous TC / Certificate",
                    url: detail.previousTcUrl ?? detail.previousCertificateUrl,
                  },
                  { label: "Marksheet", url: detail.marksheetUrl },
                ].map((doc) => (
                  <div
                    key={doc.label}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs"
                  >
                    <span className="font-medium">{doc.label}</span>
                    {isSafeHttpUrl(doc.url) ? (
                      <a
                        href={doc.url.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        Preview <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : doc.url ? (
                      <span className="text-amber-700">Invalid URL</span>
                    ) : (
                      <span className="text-muted-foreground">
                        Not uploaded
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Information */}
            {detail.payment && detail.payment.amount > 0 && (
              <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">Admission Fee Payment</h3>
                  <PaymentBadge status={detail.payment.status} />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <DetailItem
                    label="Amount"
                    value={`৳${Number(detail.payment.amount).toLocaleString()}`}
                  />
                  <DetailItem
                    label="Payment Method"
                    value={detail.payment.paymentMethod}
                  />
                  <DetailItem
                    label="Transaction ID (TrxID)"
                    value={detail.payment.transactionId ?? "Not submitted yet"}
                  />
                </div>
                {detail.payment.remarks && (
                  <p className="text-xs text-muted-foreground">
                    Note: {detail.payment.remarks}
                  </p>
                )}
                {detail.status === "PENDING" &&
                  detail.payment.status !== "PAID" && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {detail.payment.paymentMethod === "CASH" ? (
                        <button
                          type="button"
                          disabled={cashPaymentMutation.isPending}
                          onClick={() => handleCashPayment(detail.id)}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                        >
                          Confirm Cash Payment
                        </button>
                      ) : detail.payment.status === "PENDING" &&
                        detail.payment.transactionId ? (
                        <>
                          <button
                            type="button"
                            disabled={verifyOnlineMutation.isPending}
                            onClick={() =>
                              handleVerifyOnlinePayment(
                                detail.id,
                                detail.payment?.transactionId,
                              )
                            }
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Verify TrxID
                          </button>
                          <button
                            type="button"
                            disabled={rejectOnlineMutation.isPending}
                            onClick={() =>
                              handleRejectOnlinePayment(
                                detail.id,
                                detail.payment?.transactionId,
                              )
                            }
                            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                          >
                            Reject TrxID
                          </button>
                        </>
                      ) : null}
                    </div>
                  )}
              </div>
            )}

            {detail.status === "PENDING" && (
              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => {
                    const id = detail.id;
                    setDetailId(null);
                    setRejectId(id);
                    setRejectionReason("");
                  }}
                  className="rounded-lg border border-destructive/40 px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/5"
                >
                  Reject
                </button>
                {(!detail.payment ||
                  detail.payment.amount <= 0 ||
                  detail.payment.status === "PAID") && (
                  <button
                    type="button"
                    disabled={approveMutation.isPending}
                    onClick={() => handleApprove(detail.id)}
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
                  >
                    Approve &amp; Enroll Student
                  </button>
                )}
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Confirm Action Modal (Approve / Cash / Verify Online TrxID) */}
      <Modal
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        title={
          confirmAction?.type === "approve"
            ? "Approve Admission"
            : confirmAction?.type === "cash"
              ? "Confirm Cash Payment"
              : "Verify Online TrxID"
        }
        description={
          confirmAction?.type === "approve"
            ? "This will create the Student profile, Class Enrollment, and link/create the Guardian account."
            : confirmAction?.type === "cash"
              ? "Confirm that the admission fee was received in cash at the school office."
              : `Verify mobile banking transaction${confirmAction?.trxId ? ` (${confirmAction.trxId})` : ""} and mark the admission fee as PAID?`
        }
      >
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmAction(null)}
            className="rounded-lg border px-4 py-2 text-xs font-medium hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={
              approveMutation.isPending ||
              cashPaymentMutation.isPending ||
              verifyOnlineMutation.isPending
            }
            onClick={() => void executeConfirmAction()}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            Confirm
          </button>
        </div>
      </Modal>

      {/* Reject Online TrxID Modal */}
      <Modal
        open={Boolean(rejectPaymentTarget)}
        onClose={() => {
          setRejectPaymentTarget(null);
          setRejectPaymentReason("");
        }}
        title="Reject Admission TrxID"
        description={`Enter the reason for rejecting TrxID${rejectPaymentTarget?.trxId ? ` (${rejectPaymentTarget.trxId})` : ""}. The applicant will be able to resubmit a corrected TrxID.`}
      >
        <div className="space-y-4">
          <textarea
            rows={3}
            value={rejectPaymentReason}
            onChange={(e) => setRejectPaymentReason(e.target.value)}
            placeholder="e.g. TrxID not found in bKash statement (min 3 characters)"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {rejectPaymentReason.trim().length > 0 &&
            rejectPaymentReason.trim().length < 3 && (
              <p className="text-xs text-destructive">
                Please enter at least 3 characters.
              </p>
            )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setRejectPaymentTarget(null);
                setRejectPaymentReason("");
              }}
              className="rounded-lg border px-4 py-2 text-xs font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={
                rejectPaymentReason.trim().length < 3 ||
                rejectOnlineMutation.isPending
              }
              onClick={() => void executeRejectOnlinePayment()}
              className="rounded-lg bg-destructive px-4 py-2 text-xs font-medium text-destructive-foreground disabled:opacity-50"
            >
              {rejectOnlineMutation.isPending ? "Rejecting..." : "Reject TrxID"}
            </button>
          </div>
        </div>
      </Modal>

      <GuardianCredentialsModal
        credentials={guardianCredentials}
        onClose={() => setGuardianCredentials(null)}
      />
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const styles =
    status === "PAID"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "FAILED" || status === "CANCELLED"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${styles}`}
    >
      {status}
    </span>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value || "—"}</p>
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
