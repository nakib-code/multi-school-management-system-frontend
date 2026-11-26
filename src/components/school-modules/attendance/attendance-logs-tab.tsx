"use client";

import {
  CalendarCheck,
  History,
  Pencil,
  Search,
  Trash2,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAttendanceHistory,
  useAttendancesPaginated,
  useDeleteAttendance,
  useUpdateAttendance,
} from "@/features/attendance/hooks";
import type {
  AttendanceRecord,
  AttendanceStatus,
} from "@/features/attendance/types";
import { getApiErrorMessage } from "@/lib/api";
import {
  formatLocalDateDisplay,
  getSchoolTodayStr,
  isWithinTeacherEditWindow,
  toDateOnlyStr,
} from "@/lib/attendance-date";
import {
  ATTENDANCE_STATUS_CONFIG,
  AttendanceStatusBadge,
} from "./status-badge";

interface AttendanceLogsTabProps {
  schoolId: number;
  isTeacher: boolean;
  canDelete: boolean;
  classes: Array<{ id: number; name: string }>;
  sections: Array<{ id: number; name: string; classId: number }>;
  selectedClassId: string;
  selectedSectionId: string;
  onClassChange: (classId: string) => void;
  onSectionChange: (sectionId: string) => void;
}

export function AttendanceLogsTab({
  schoolId,
  isTeacher,
  canDelete,
  classes,
  sections,
  selectedClassId,
  selectedSectionId,
  onClassChange,
  onSectionChange,
}: AttendanceLogsTabProps) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(
    null,
  );
  const [editStatus, setEditStatus] = useState<AttendanceStatus>("PRESENT");
  const [editRemarks, setEditRemarks] = useState("");

  const [deletingRecord, setDeletingRecord] = useState<AttendanceRecord | null>(
    null,
  );
  const [historyRecord, setHistoryRecord] = useState<AttendanceRecord | null>(
    null,
  );

  const logsQuery = useAttendancesPaginated(schoolId, {
    ...(selectedClassId ? { classId: Number(selectedClassId) } : {}),
    ...(selectedSectionId ? { sectionId: Number(selectedSectionId) } : {}),
    ...(fromDate ? { fromDate } : {}),
    ...(toDate ? { toDate } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
    page,
    pageSize: 25,
  });

  const updateMut = useUpdateAttendance(schoolId);
  const deleteMut = useDeleteAttendance(schoolId);
  const historyQuery = useAttendanceHistory(
    schoolId,
    historyRecord ? historyRecord.id : null,
  );

  const applyTodaysAbsentees = () => {
    const today = getSchoolTodayStr();
    setFromDate(today);
    setToDate(today);
    setStatusFilter("ABSENT");
    setPage(1);
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setStatusFilter("");
    setSearch("");
    setPage(1);
  };

  const openEdit = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setEditStatus(rec.status);
    setEditRemarks(rec.remarks ?? "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    if (editStatus === "EXCUSED" && !editRemarks.trim()) {
      toast.error("Remarks are required when marking EXCUSED");
      return;
    }
    await updateMut.mutateAsync({
      id: editingRecord.id,
      payload: {
        status: editStatus,
        remarks: editRemarks.trim() || null,
      },
    });
    setEditingRecord(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    await deleteMut.mutateAsync(deletingRecord.id);
    setDeletingRecord(null);
  };

  const records = logsQuery.data?.records ?? [];
  const meta = logsQuery.data?.meta;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="mobile-filter-bar">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Class</Label>
          <select
            value={selectedClassId}
            onChange={(e) => {
              onClassChange(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-[11px] border bg-background px-3 text-sm sm:h-9 sm:w-auto"
          >
            <option value="">
              {isTeacher ? "All My Classes" : "All Classes"}
            </option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Section</Label>
          <select
            value={selectedSectionId}
            disabled={!selectedClassId}
            onChange={(e) => {
              onSectionChange(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-[11px] border bg-background px-3 text-sm disabled:opacity-50 sm:h-9 sm:w-auto"
          >
            <option value="">All Sections</option>
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-[11px] sm:h-9 sm:w-36"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-[11px] sm:h-9 sm:w-36"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 w-full rounded-[11px] border bg-background px-3 text-sm sm:h-9 sm:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
            <option value="EXCUSED">Excused</option>
          </select>
        </div>

        <div className="space-y-1 sm:min-w-[180px] sm:flex-1">
          <Label className="text-xs text-muted-foreground">
            Search Student
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Name or ID..."
              className="h-10 rounded-[11px] pl-8 text-sm sm:h-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={applyTodaysAbsentees}
            className="min-h-[44px] gap-1.5 rounded-[11px] border-red-200 text-red-700 hover:bg-red-50 sm:min-h-0"
          >
            <UserX className="h-3.5 w-3.5" />
            Today&apos;s Absentees
          </Button>
          {(fromDate || toDate || statusFilter || search) && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={clearFilters}
              className="min-h-[44px] sm:min-h-0"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {logsQuery.isLoading ? (
        <LoadingState message="Loading attendance logs..." />
      ) : logsQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(
            logsQuery.error,
            "Failed to load attendance logs",
          )}
          onRetry={() => logsQuery.refetch()}
        />
      ) : records.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No attendance records match"
          description="Try adjusting your date range, status, or student search filters."
        />
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="space-y-2.5 md:hidden">
            {records.map((r) => {
              const dateStr = toDateOnlyStr(r.date);
              const canEditRow =
                !isTeacher || isWithinTeacherEditWindow(dateStr);
              return (
                <div key={r.id} className="mobile-card space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">
                        {r.student
                          ? `${r.student.firstName} ${r.student.lastName ?? ""}`
                          : `Student #${r.studentId}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatLocalDateDisplay(r.date)} •{" "}
                        {r.enrollment?.class?.name ?? "—"}
                        {r.enrollment?.section
                          ? ` (${r.enrollment.section.name})`
                          : ""}
                      </p>
                    </div>
                    <AttendanceStatusBadge status={r.status} />
                  </div>
                  {r.remarks && (
                    <p className="rounded-[9px] bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground">
                      Remarks: {r.remarks}
                    </p>
                  )}
                  <div className="flex flex-wrap justify-end gap-1.5 border-t pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setHistoryRecord(r)}
                      className="h-9 gap-1 text-xs"
                    >
                      <History className="h-3.5 w-3.5" />
                      History
                    </Button>
                    {canEditRow && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(r)}
                        className="h-9 gap-1 text-xs"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingRecord(r)}
                        className="h-9 gap-1 text-xs text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="surface-panel hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Remarks</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((r) => {
                  const dateStr = toDateOnlyStr(r.date);
                  const canEditRow =
                    !isTeacher || isWithinTeacherEditWindow(dateStr);
                  return (
                    <tr key={r.id}>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {formatLocalDateDisplay(r.date)}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {r.student
                          ? `${r.student.firstName} ${r.student.lastName ?? ""}`
                          : `Student #${r.studentId}`}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {r.enrollment?.class?.name ?? "—"}
                        {r.enrollment?.section
                          ? ` • ${r.enrollment.section.name}`
                          : ""}
                      </td>
                      <td className="px-4 py-3">
                        <AttendanceStatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {r.remarks ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setHistoryRecord(r)}
                            title="View change history"
                            className="h-8 gap-1 px-2 text-xs"
                          >
                            <History className="h-3.5 w-3.5" />
                            History
                          </Button>
                          {canEditRow && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(r)}
                              title="Edit record"
                              className="h-8 gap-1 px-2 text-xs"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeletingRecord(r)}
                              title="Delete record"
                              className="h-8 px-2 text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                Showing page {meta.page} of {meta.totalPages} ({meta.total}{" "}
                records)
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Inline Edit Modal */}
      <Modal
        open={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        title="Edit Attendance Record"
        description={
          editingRecord
            ? `${editingRecord.student?.firstName ?? ""} ${editingRecord.student?.lastName ?? ""} • ${formatLocalDateDisplay(editingRecord.date)}`
            : undefined
        }
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const).map((st) => {
                const cfg = ATTENDANCE_STATUS_CONFIG[st];
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setEditStatus(st)}
                    className={`min-h-[42px] rounded-[11px] border px-3 text-xs font-semibold transition ${
                      editStatus === st
                        ? cfg.activeBtnClass
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {cfg.code} — {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-att-remarks">
              Remarks {editStatus === "EXCUSED" ? "*" : "(Optional)"}
            </Label>
            <Input
              id="edit-att-remarks"
              required={editStatus === "EXCUSED"}
              value={editRemarks}
              onChange={(e) => setEditRemarks(e.target.value)}
              placeholder={
                editStatus === "EXCUSED"
                  ? "Reason for excused absence..."
                  : "Optional remarks..."
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingRecord(null)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMut.isPending}>
              {updateMut.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Dialog */}
      <Modal
        open={Boolean(deletingRecord)}
        onClose={() => setDeletingRecord(null)}
        title="Delete Attendance Record"
        description="This will permanently remove the attendance record and its change history."
        maxWidthClass="max-w-sm"
      >
        <div className="space-y-4">
          {deletingRecord && (
            <p className="text-sm text-muted-foreground">
              Delete attendance for{" "}
              <strong className="text-foreground">
                {deletingRecord.student?.firstName}{" "}
                {deletingRecord.student?.lastName ?? ""}
              </strong>{" "}
              on{" "}
              <strong className="text-foreground">
                {formatLocalDateDisplay(deletingRecord.date)}
              </strong>
              ?
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingRecord(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMut.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteMut.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal
        open={Boolean(historyRecord)}
        onClose={() => setHistoryRecord(null)}
        title="Attendance Change History"
        description={
          historyRecord
            ? `${historyRecord.student?.firstName ?? ""} ${historyRecord.student?.lastName ?? ""} • ${formatLocalDateDisplay(historyRecord.date)}`
            : undefined
        }
        maxWidthClass="max-w-md"
      >
        {historyQuery.isLoading ? (
          <LoadingState message="Loading history..." />
        ) : historyQuery.isError ? (
          <ErrorState
            message={getApiErrorMessage(
              historyQuery.error,
              "Failed to load history",
            )}
            onRetry={() => historyQuery.refetch()}
          />
        ) : (historyQuery.data ?? []).length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No history entries recorded for this attendance.
          </p>
        ) : (
          <div className="space-y-2.5">
            {(historyQuery.data ?? []).map((item) => (
              <div
                key={item.id}
                className="rounded-[11px] border bg-muted/20 p-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">
                    {item.oldStatus
                      ? `${item.oldStatus} → ${item.newStatus}`
                      : `Created as ${item.newStatus}`}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(item.changedAt).toLocaleString()}
                  </span>
                </div>
                {(item.oldRemarks || item.newRemarks) && (
                  <p className="mt-1 text-muted-foreground">
                    Remarks: {item.oldRemarks ?? "—"} → {item.newRemarks ?? "—"}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  By {item.changedByUser.name} ({item.changedByUser.role})
                </p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
