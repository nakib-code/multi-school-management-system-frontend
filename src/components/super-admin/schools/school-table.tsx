"use client";

import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  School as SchoolIcon,
  ShieldBan,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";


import type {
  School,
  SchoolStatus,
} from "@/types/school";

import { RejectSchoolDialog } from "./reject-school-dialog";
import { SchoolFilters } from "./school-filters";
import { SchoolStatusBadge } from "./school-status-badge";
import { approveSchool, blockSchool, deleteSchool, getSchools, rejectSchool, unblockSchool } from "@/features/schools/api";

const PAGE_SIZE = 10;

export function SchoolTable() {
  const [schools, setSchools] = useState<School[]>(
    [],
  );

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<SchoolStatus>();

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);

  const [actionLoadingId, setActionLoadingId] =
    useState<number | null>(null);

  const [rejectingSchool, setRejectingSchool] =
    useState<School | null>(null);

  const [rejectLoading, setRejectLoading] =
    useState(false);

  const loadSchools = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getSchools({
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        status,
      });

      setSchools(result.schools);
      setTotal(result.meta.total);
      setTotalPages(result.meta.totalPages);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load schools";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (
    value?: SchoolStatus,
  ) => {
    setStatus(value);
    setPage(1);
  };

  const handleReset = () => {
    setSearch("");
    setStatus(undefined);
    setPage(1);
  };

  const runSchoolAction = async (
    school: School,
    action: () => Promise<School>,
    successMessage: string,
  ) => {
    try {
      setActionLoadingId(school.id);

      await action();

      toast.success(successMessage);

      await loadSchools();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong";

      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApprove = (school: School) => {
    if (
      !window.confirm(
        `Are you sure you want to approve "${school.name}"?`,
      )
    ) {
      return;
    }

    runSchoolAction(
      school,
      () => approveSchool(school.id),
      "School approved successfully",
    );
  };

  const handleBlock = (school: School) => {
    if (
      !window.confirm(
        `Are you sure you want to block "${school.name}"?`,
      )
    ) {
      return;
    }

    runSchoolAction(
      school,
      () => blockSchool(school.id),
      "School blocked successfully",
    );
  };

  const handleUnblock = (school: School) => {
    if (
      !window.confirm(
        `Are you sure you want to unblock "${school.name}"?`,
      )
    ) {
      return;
    }

    runSchoolAction(
      school,
      () => unblockSchool(school.id),
      "School unblocked successfully",
    );
  };

  const handleDelete = async (school: School) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${school.name}"?`,
      )
    ) {
      return;
    }

    try {
      setActionLoadingId(school.id);

      await deleteSchool(school.id);

      toast.success(
        "School deleted successfully",
      );

      await loadSchools();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete school";

      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (
    rejectionReason: string,
  ) => {
    if (!rejectingSchool) {
      return;
    }

    try {
      setRejectLoading(true);

      await rejectSchool(
        rejectingSchool.id,
        rejectionReason,
      );

      toast.success(
        "School rejected successfully",
      );

      setRejectingSchool(null);

      await loadSchools();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to reject school";

      toast.error(message);
    } finally {
      setRejectLoading(false);
    }
  };

  const startIndex =
    total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const endIndex = Math.min(
    page * PAGE_SIZE,
    total,
  );

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <SchoolFilters
          search={search}
          status={status}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onReset={handleReset}
        />

        {/* Table */}
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
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="h-48 text-center"
                    >
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading schools...
                      </div>
                    </td>
                  </tr>
                ) : schools.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="h-56 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <SchoolIcon className="h-6 w-6 text-muted-foreground" />
                        </div>

                        <p className="font-medium">
                          No schools found
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Try changing your search or
                          filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  schools.map((school) => {
                    const isLoading =
                      actionLoadingId === school.id;

                    return (
                      <tr
                        key={school.id}
                        className="border-b last:border-b-0 hover:bg-muted/30"
                      >
                        {/* School */}
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
                              <p className="truncate font-medium">
                                {school.name}
                              </p>

                              {school.email && (
                                <p className="truncate text-xs text-muted-foreground">
                                  {school.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="px-4 py-4">
                          <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs">
                            {school.code}
                          </span>
                        </td>

                        {/* Admin */}
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

                        {/* Contact */}
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <p>
                              {school.phone || "—"}
                            </p>

                            {school.adminPhone && (
                              <p className="text-xs text-muted-foreground">
                                Admin:{" "}
                                {school.adminPhone}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <SchoolStatusBadge
                            status={school.status}
                          />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          {isLoading ? (
                            <div className="flex justify-end">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          ) : (
                            <div className="flex justify-end gap-1">
                              {school.status ===
                                "PENDING" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleApprove(
                                        school,
                                      )
                                    }
                                    className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10"
                                    title="Approve"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRejectingSchool(
                                        school,
                                      )
                                    }
                                    className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                                    title="Reject"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </>
                              )}

                              {school.status ===
                                "ACTIVE" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleBlock(
                                      school,
                                    )
                                  }
                                  className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-500/10"
                                  title="Block"
                                >
                                  <ShieldBan className="h-4 w-4" />
                                </button>
                              )}

                              {school.status ===
                                "BLOCKED" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUnblock(
                                      school,
                                    )
                                  }
                                  className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10"
                                  title="Unblock"
                                >
                                  <ShieldCheck className="h-4 w-4" />
                                </button>
                              )}

                              {school.status ===
                                "REJECTED" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      school,
                                    )
                                  }
                                  className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
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

          {/* Pagination */}
          {!loading && total > 0 && (
            <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {startIndex}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {endIndex}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {total}
                </span>{" "}
                schools
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.max(current - 1, 1),
                    )
                  }
                  disabled={page === 1}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <span className="px-2 text-sm text-muted-foreground">
                  Page{" "}
                  <span className="font-medium text-foreground">
                    {page}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {totalPages}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        current + 1,
                        totalPages,
                      ),
                    )
                  }
                  disabled={
                    page >= totalPages
                  }
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

      {/* Reject Dialog */}
      <RejectSchoolDialog
        school={rejectingSchool}
        open={Boolean(rejectingSchool)}
        loading={rejectLoading}
        onClose={() => {
          if (!rejectLoading) {
            setRejectingSchool(null);
          }
        }}
        onConfirm={handleReject}
      />
    </>
  );
}