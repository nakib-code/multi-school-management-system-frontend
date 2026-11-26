"use client";

import { CalendarCheck, Check, CheckCheck, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClasses, useSections } from "@/features/admin/classes/hooks";
import {
  useAttendances,
  useBulkMarkAttendance,
  useDeleteAttendance,
} from "@/features/attendance/hooks";
import type { AttendanceStatus } from "@/features/attendance/types";
import { useEnrollments } from "@/features/enrollments/hooks";
import { useTeacherAssignments } from "@/features/teachers/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const STATUS_STYLES: Record<AttendanceStatus, string> = {
  PRESENT: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ABSENT: "border-red-200 bg-red-50 text-red-700",
  LATE: "border-amber-200 bg-amber-50 text-amber-700",
  EXCUSED: "border-blue-200 bg-blue-50 text-blue-700",
};

const currentMonthStr = () => new Date().toISOString().slice(0, 7);

export function AttendanceWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const role = user?.role ?? "";
  const isTeacher = role === "TEACHER";
  const canMark = role === "ADMIN" || role === "MANAGER" || isTeacher;
  const canDelete = role === "ADMIN" || role === "MANAGER";

  // Staff state
  const [tab, setTab] = useState<"records" | "mark">(canMark ? "mark" : "records");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [statuses, setStatuses] = useState<Record<number, AttendanceStatus>>({});
  const [remarksMap, setRemarksMap] = useState<Record<number, string>>({});

  // Guardian / Student sheet filters
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [selectedChildId, setSelectedChildId] = useState("");

  const monthRange = useMemo(() => {
    if (!selectedMonth) return {};
    const [y, m] = selectedMonth.split("-").map(Number);
    if (!y || !m) return {};
    const fromDate = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const toDate = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    return { fromDate, toDate };
  }, [selectedMonth]);

  const recordsQuery = useAttendances(schoolId, {
    ...(canMark && selectedClassId ? { classId: Number(selectedClassId) } : {}),
    ...(canMark && selectedSectionId
      ? { sectionId: Number(selectedSectionId) }
      : {}),
    ...(!canMark ? monthRange : {}),
  });

  const { data: allClasses = [] } = useClasses(canMark ? schoolId : 0);
  const { data: allSections = [] } = useSections(canMark ? schoolId : 0);
  const { data: teacherAssignments = [] } = useTeacherAssignments(
    isTeacher ? schoolId : 0,
  );

  const enrollmentsQuery = useEnrollments(canMark ? schoolId : 0, {
    status: "ACTIVE",
    ...(selectedClassId ? { classId: Number(selectedClassId) } : {}),
    ...(selectedSectionId ? { sectionId: Number(selectedSectionId) } : {}),
  });

  const bulkMut = useBulkMarkAttendance(schoolId);
  const deleteMut = useDeleteAttendance(schoolId);

  const availableClasses = useMemo(() => {
    if (!isTeacher) return allClasses;
    const assigned = new Set(teacherAssignments.map((a) => a.classId));
    return allClasses.filter((c) => assigned.has(c.id));
  }, [isTeacher, allClasses, teacherAssignments]);

  const availableSections = useMemo(() => {
    const cid = Number(selectedClassId);
    if (!cid) return [];
    const byClass = allSections.filter((s) => s.classId === cid);
    if (!isTeacher) return byClass;
    const assigned = new Set(
      teacherAssignments
        .filter((a) => a.classId === cid)
        .map((a) => a.sectionId),
    );
    return byClass.filter((s) => assigned.has(s.id));
  }, [isTeacher, allSections, selectedClassId, teacherAssignments]);

  const activeEnrollments = useMemo(() => {
    const raw = enrollmentsQuery.data ?? [];
    if (!isTeacher) return raw;
    return raw.filter((en) =>
      teacherAssignments.some(
        (a) =>
          a.classId === en.classId &&
          (en.sectionId === null || a.sectionId === en.sectionId),
      ),
    );
  }, [enrollmentsQuery.data, isTeacher, teacherAssignments]);

  const allRecords = recordsQuery.data ?? [];

  // Child list for multi-child guardians
  const guardianChildren = useMemo(() => {
    const map = new Map<number, string>();
    for (const r of allRecords) {
      if (r.student && !map.has(r.studentId)) {
        map.set(
          r.studentId,
          `${r.student.firstName} ${r.student.lastName ?? ""} (${r.student.studentId})`.trim(),
        );
      }
    }
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [allRecords]);

  const visibleRecords = useMemo(() => {
    if (!canMark && selectedChildId) {
      return allRecords.filter((r) => r.studentId === Number(selectedChildId));
    }
    return allRecords;
  }, [allRecords, canMark, selectedChildId]);

  const summary = useMemo(() => {
    const total = visibleRecords.length;
    const present = visibleRecords.filter((r) => r.status === "PRESENT").length;
    const absent = visibleRecords.filter((r) => r.status === "ABSENT").length;
    const lateOrExcused = visibleRecords.filter(
      (r) => r.status === "LATE" || r.status === "EXCUSED",
    ).length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, lateOrExcused, pct };
  }, [visibleRecords]);

  if (recordsQuery.isLoading) {
    return <LoadingState message="Loading attendance..." />;
  }
  if (recordsQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          recordsQuery.error,
          "Failed to load attendance",
        )}
        onRetry={() => recordsQuery.refetch()}
      />
    );
  }

  const handleMarkAllPresent = () => {
    const next: Record<number, AttendanceStatus> = {};
    for (const en of activeEnrollments) {
      next[en.id] = "PRESENT";
    }
    setStatuses(next);
  };

  const handleBulkSave = async () => {
    if (activeEnrollments.length === 0) return;
    await bulkMut.mutateAsync({
      date,
      records: activeEnrollments.map((en) => ({
        studentId: en.studentId,
        enrollmentId: en.id,
        status: statuses[en.id] ?? "PRESENT",
        ...(remarksMap[en.id]?.trim()
          ? { remarks: remarksMap[en.id].trim() }
          : {}),
      })),
    });
    setTab("records");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {canMark ? "Attendance & Instant Alerts" : "Attendance Sheet"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {canMark
            ? "Mark daily class attendance — guardians automatically receive instant zero-cost in-app alerts."
            : "Monthly attendance summary, percentage, and teacher remarks."}
        </p>
      </div>

      {/* Guardian / Student Summary Cards & Filters */}
      {!canMark && (
        <div className="space-y-3.5">
          <div className="mobile-filter-bar">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Month</Label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="h-10 w-full rounded-[11px] sm:h-9 sm:w-44"
              />
            </div>

            {selectedMonth && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setSelectedMonth("")}
                className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
              >
                All Time
              </Button>
            )}

            {guardianChildren.length > 1 && (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Child</Label>
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="h-10 w-full rounded-[11px] border bg-background px-3 text-sm sm:h-9 sm:w-auto"
                >
                  <option value="">All Children</option>
                  {guardianChildren.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            <SummaryCard label="Total Days" value={String(summary.total)} />
            <SummaryCard
              label="Present %"
              value={`${summary.pct}%`}
              sub={`${summary.present} day(s)`}
              accent="text-emerald-600"
            />
            <SummaryCard
              label="Absent"
              value={String(summary.absent)}
              accent="text-red-600"
            />
            <SummaryCard
              label="Late / Excused"
              value={String(summary.lateOrExcused)}
              accent="text-amber-600"
            />
          </div>
        </div>
      )}

      {/* Staff Tabs */}
      {canMark && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-b">
          <button
            type="button"
            onClick={() => setTab("mark")}
            className={`min-h-[44px] shrink-0 border-b-2 px-3.5 py-2 text-sm font-medium ${
              tab === "mark"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Mark Bulk Attendance
          </button>
          <button
            type="button"
            onClick={() => setTab("records")}
            className={`min-h-[44px] shrink-0 border-b-2 px-3.5 py-2 text-sm font-medium ${
              tab === "records"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Attendance Logs ({visibleRecords.length})
          </button>
        </div>
      )}

      {/* Staff Class/Section Filter */}
      {canMark && (
        <div className="mobile-filter-bar">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Class</Label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedSectionId("");
              }}
              className="h-10 w-full rounded-[11px] border bg-background px-3 text-sm sm:h-9 sm:w-auto"
            >
              <option value="">
                {isTeacher ? "All My Assigned Classes" : "All Classes"}
              </option>
              {availableClasses.map((c) => (
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
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="h-10 w-full rounded-[11px] border bg-background px-3 text-sm disabled:opacity-50 sm:h-9 sm:w-auto"
            >
              <option value="">All Sections</option>
              {availableSections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
          </div>

          {tab === "mark" && (
            <>
              <div className="space-y-1">
                <Label htmlFor="att-date" className="text-xs text-muted-foreground">
                  Attendance Date
                </Label>
                <Input
                  id="att-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10 w-full rounded-[11px] sm:h-9 sm:w-40"
                />
              </div>

              <div className="grid grid-cols-1 gap-2 sm:ml-auto sm:flex sm:flex-wrap">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleMarkAllPresent}
                  disabled={activeEnrollments.length === 0}
                  className="min-h-[44px] gap-1.5 rounded-[11px] sm:min-h-0"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark All Present
                </Button>
                <Button
                  size="sm"
                  onClick={handleBulkSave}
                  disabled={bulkMut.isPending || activeEnrollments.length === 0}
                  className="min-h-[44px] gap-1.5 rounded-[11px] sm:min-h-0"
                >
                  <Check className="h-4 w-4" />
                  {bulkMut.isPending
                    ? "Saving & Alerting..."
                    : "Save & Notify Guardians"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Bulk Mark View (Mobile Cards + Desktop Table) */}
      {tab === "mark" && canMark ? (
        activeEnrollments.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No active enrollments in this selection"
            description="Select a class/section with enrolled students to mark attendance."
          />
        ) : (
          <>
            {/* Mobile Bulk Marking Cards */}
            <div className="space-y-2.5 md:hidden">
              {activeEnrollments.map((en) => {
                const currentStatus = statuses[en.id] ?? "PRESENT";
                return (
                  <div key={en.id} className="mobile-card space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">
                          {en.student
                            ? `${en.student.firstName} ${en.student.lastName ?? ""}`
                            : `Student #${en.studentId}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {en.class?.name ?? en.classId}
                          {en.section ? ` • ${en.section.name}` : ""}
                          {en.rollNumber ? ` • Roll #${en.rollNumber}` : ""}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[currentStatus]}`}
                      >
                        {currentStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {(["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const).map(
                        (st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() =>
                              setStatuses((prev) => ({ ...prev, [en.id]: st }))
                            }
                            className={`min-h-[44px] rounded-[11px] border px-2.5 text-xs font-semibold transition ${
                              currentStatus === st
                                ? STATUS_STYLES[st]
                                : "bg-background text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {st}
                          </button>
                        ),
                      )}
                    </div>

                    <Input
                      value={remarksMap[en.id] ?? ""}
                      onChange={(e) =>
                        setRemarksMap((prev) => ({
                          ...prev,
                          [en.id]: e.target.value,
                        }))
                      }
                      placeholder="Remarks (optional, e.g. 15m late)"
                      className="h-10 rounded-[11px] text-xs"
                    />
                  </div>
                );
              })}
            </div>

            {/* Desktop Bulk Marking Table */}
            <div className="surface-panel hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5">Student</th>
                    <th className="px-4 py-2.5">Class / Section</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Remarks (Optional)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activeEnrollments.map((en) => {
                    const currentStatus = statuses[en.id] ?? "PRESENT";
                    return (
                      <tr key={en.id}>
                        <td className="px-4 py-2.5 font-medium">
                          {en.student
                            ? `${en.student.firstName} ${en.student.lastName ?? ""}`
                            : `Student #${en.studentId}`}
                          {en.rollNumber ? (
                            <span className="ml-2 text-xs text-muted-foreground">
                              Roll #{en.rollNumber}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">
                          {en.class?.name ?? en.classId}
                          {en.section ? ` — ${en.section.name}` : ""}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {(
                              ["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const
                            ).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() =>
                                  setStatuses((prev) => ({
                                    ...prev,
                                    [en.id]: st,
                                  }))
                                }
                                className={`rounded-[9px] border px-2 py-1 text-[11px] font-medium transition ${
                                  currentStatus === st
                                    ? STATUS_STYLES[st]
                                    : "bg-background text-muted-foreground hover:bg-muted"
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <Input
                            value={remarksMap[en.id] ?? ""}
                            onChange={(e) =>
                              setRemarksMap((prev) => ({
                                ...prev,
                                [en.id]: e.target.value,
                              }))
                            }
                            placeholder="e.g. Arrived 15m late"
                            className="h-8 text-xs"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )
      ) : visibleRecords.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No attendance records found"
          description="Daily student attendance logs will appear here."
        />
      ) : (
        <>
          {/* Mobile Attendance Sheet Cards */}
          <div className="space-y-2.5 md:hidden">
            {visibleRecords.map((r) => (
              <div key={r.id} className="mobile-card space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {r.student
                        ? `${r.student.firstName} ${r.student.lastName ?? ""}`
                        : `Student #${r.studentId}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.date).toLocaleDateString()} •{" "}
                      {r.enrollment?.class?.name ?? "—"}
                      {r.enrollment?.section
                        ? ` (${r.enrollment.section.name})`
                        : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[r.status]}`}
                  >
                    {r.status}
                  </span>
                </div>
                {r.remarks && (
                  <p className="rounded-[9px] bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground">
                    Remarks: {r.remarks}
                  </p>
                )}
                {canDelete && (
                  <div className="flex justify-end border-t pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMut.mutate(r.id)}
                      className="text-xs text-destructive"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Attendance Log Table */}
          <div className="surface-panel hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Remarks</th>
                  {canDelete && (
                    <th className="px-4 py-3 text-right">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {visibleRecords.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-xs">
                      {new Date(r.date).toLocaleDateString()}
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
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status]}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {r.remarks ?? "—"}
                    </td>
                    {canDelete && (
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMut.mutate(r.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold ${accent ?? "text-foreground"}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
