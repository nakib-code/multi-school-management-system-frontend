"use client";

import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  School as SchoolIcon,
  ShieldBan,
  ShieldCheck,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import {
  useApproveSchool,
  useBlockSchool,
  useDeleteSchool,
  useRejectSchool,
  useSchools,
  useUnblockSchool,
} from "@/features/schools/hooks";
import type { School, SchoolStatus } from "@/types/school";

import { RejectSchoolDialog } from "./reject-school-dialog";
import { SchoolFilters } from "./school-filters";
import { SchoolStatusBadge } from "./school-status-badge";

const PAGE_SIZE = 10;

export function SchoolTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SchoolStatus>();
  const [rejectingSchool, setRejectingSchool] = useState<School | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<School | null>(null);

  const { data, isLoading, isFetching } = useSchools({
    page,
    limit: PAGE_SIZE,
    search: search.trim() || undefined,
    status,
  });

  const approveMutation = useApproveSchool();
  const rejectMutation = useRejectSchool();
  const blockMutation = useBlockSchool();
  const unblockMutation = useUnblockSchool();
  const deleteMutation = useDeleteSchool();

  const schools = data?.schools ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 0;

  const actionLoadingId =
    approveMutation.variables ??
    blockMutation.variables ??
    unblockMutation.variables ??
    deleteMutation.variables ??
    null;

  const isRejectLoading = rejectMutation.isPending;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value?: SchoolStatus) => {
    setStatus(value);
    setPage(1);
  };

  const handleReset = () => {
    setSearch("");
    setStatus(undefined);
    setPage(1);
  };

  const handleApprove = async (school: School) => {
    if (!window.confirm(`Are you sure you want to approve "${school.name}"?`)) {
      return;
    }

    try {
      await approveMutation.mutateAsync(school.id);
      toast.success("School approved successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to approve school",
      );
    }
  };

  const handleBlock = async (school: School) => {
    if (!window.confirm(`Are you sure you want to block "${school.name}"?`)) {
      return;
    }

    try {
      await blockMutation.mutateAsync(school.id);
      toast.success("School blocked successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to block school",
      );
    }
  };

  const handleUnblock = async (school: School) => {
    if (!window.confirm(`Are you sure you want to unblock "${school.name}"?`)) {
      return;
    }

    try {
      await unblockMutation.mutateAsync(school.id);
      toast.success("School unblocked successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to unblock school",
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSchool) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(deletingSchool.id);

      toast.success("School deleted successfully", {
        description: `${deletingSchool.name} has been permanently removed.`,
      });

      setDeletingSchool(null);

      // If the last item on the current page was deleted,
      // move back to the previous page.
      if (schools.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete school",
      );
    }
  };

  const handleReject = async (rejectionReason: string) => {
    if (!rejectingSchool) {
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        id: rejectingSchool.id,
        payload: {
          rejectionReason,
        },
      });

      toast.success("School rejected successfully");
      setRejectingSchool(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reject school",
      );
    }
  };

  const startIndex = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, total);

  const isAnyActionPending =
    approveMutation.isPending ||
    blockMutation.isPending ||
    unblockMutation.isPending ||
    deleteMutation.isPending;

  return (
    <>
      <div className="space-y-4">
        <SchoolFilters
          search={search}
          status={status}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onReset={handleReset}
        />

        <div className="overflow-hidden rounded-xl border bg-background">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    School
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Code
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Admin
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Contact
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="h-48 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading schools...
                      </div>
                    </td>
                  </tr>
                ) : schools.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-56 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <SchoolIcon className="h-6 w-6 text-muted-foreground" />
                        </div>

                        <p className="font-medium">No schools found</p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Try changing your search or filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  schools.map((school) => {
                    const isCurrentActionLoading =
                      actionLoadingId === school.id;

                    return (
                      <tr
                        key={school.id}
                        className="border-b last:border-b-0 hover:bg-muted/30"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                              {school.logo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={school.logo}
                                  alt={school.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <SchoolIcon className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <Link
                                href={`/dashboard/super-admin/schools/${school.id}`}
                                className="block truncate font-medium transition-colors hover:text-primary"
                              >
                                {school.name}
                              </Link>

                              {school.email && (
                                <p className="truncate text-xs text-muted-foreground">
                                  {school.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs">
                            {school.code}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium">
                              {school.adminName || "—"}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {school.adminEmail || "—"}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p>{school.phone || "—"}</p>

                            {school.adminPhone && (
                              <p className="text-xs text-muted-foreground">
                                Admin: {school.adminPhone}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <SchoolStatusBadge status={school.status} />
                        </td>

                        <td className="px-4 py-4">
                          {isCurrentActionLoading ? (
                            <div className="flex justify-end">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          ) : (
                            <div className="flex justify-end gap-1">
                              {school.status === "PENDING" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(school)}
                                    disabled={isAnyActionPending}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-green-600 transition hover:bg-green-50 disabled:pointer-events-none disabled:opacity-50 dark:text-green-400 dark:hover:bg-green-500/10"
                                    title="Approve"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="sr-only">
                                      Approve school
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setRejectingSchool(school)}
                                    disabled={isAnyActionPending}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
                                    title="Reject"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    <span className="sr-only">
                                      Reject school
                                    </span>
                                  </button>
                                </>
                              )}

                              {school.status === "ACTIVE" && (
                                <button
                                  type="button"
                                  onClick={() => handleBlock(school)}
                                  disabled={isAnyActionPending}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-orange-600 transition hover:bg-orange-50 disabled:pointer-events-none disabled:opacity-50 dark:text-orange-400 dark:hover:bg-orange-500/10"
                                  title="Block"
                                >
                                  <ShieldBan className="h-4 w-4" />
                                  <span className="sr-only">
                                    Block school
                                  </span>
                                </button>
                              )}

                              {school.status === "BLOCKED" && (
                                <button
                                  type="button"
                                  onClick={() => handleUnblock(school)}
                                  disabled={isAnyActionPending}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-green-600 transition hover:bg-green-50 disabled:pointer-events-none disabled:opacity-50 dark:text-green-400 dark:hover:bg-green-500/10"
                                  title="Unblock"
                                >
                                  <ShieldCheck className="h-4 w-4" />
                                  <span className="sr-only">
                                    Unblock school
                                  </span>
                                </button>
                              )}

                              {school.status === "REJECTED" && (
                                <button
                                  type="button"
                                  onClick={() => setDeletingSchool(school)}
                                  disabled={isAnyActionPending}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
                                  title="Delete permanently"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">
                                    Delete school permanently
                                  </span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && total > 0 && (
            <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {startIndex}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">{endIndex}</span>{" "}
                of{" "}
                <span className="font-medium text-foreground">{total}</span>{" "}
                schools
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.max(current - 1, 1))
                  }
                  disabled={page === 1 || isFetching}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <span className="px-2 text-sm text-muted-foreground">
                  Page{" "}
                  <span className="font-medium text-foreground">{page}</span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {totalPages}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(current + 1, totalPages))
                  }
                  disabled={page >= totalPages || isFetching}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <RejectSchoolDialog
        school={rejectingSchool}
        open={Boolean(rejectingSchool)}
        loading={isRejectLoading}
        onClose={() => {
          if (!isRejectLoading) {
            setRejectingSchool(null);
          }
        }}
        onConfirm={handleReject}
      />

      <DeleteSchoolDialog
        school={deletingSchool}
        open={Boolean(deletingSchool)}
        loading={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeletingSchool(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                         Delete Confirmation Dialog                         */
/* -------------------------------------------------------------------------- */

interface DeleteSchoolDialogProps {
  school: School | null;
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteSchoolDialog({
  school,
  open,
  loading,
  onClose,
  onConfirm,
}: DeleteSchoolDialogProps) {
  if (!open || !school) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-school-title"
    >
      <div className="w-full max-w-md rounded-2xl border bg-background shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>

            <div className="min-w-0">
              <h2
                id="delete-school-title"
                className="text-lg font-semibold"
              >
                Delete school permanently?
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                You are about to permanently delete{" "}
                <span className="font-medium text-foreground">
                  {school.name}
                </span>
                .
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <p className="text-sm font-medium text-destructive">
              This action cannot be undone.
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              The school and its associated data will be permanently removed
              from the system.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-destructive px-4 text-sm font-semibold text-destructive-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Permanently
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}