"use client";

import {
  AlertCircle,
  CalendarCheck,
  CalendarOff,
  Check,
  CheckCheck,
  Info,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useBulkMarkAttendance,
  useDayAttendance,
} from "@/features/attendance/hooks";
import type {
  AttendanceStatus,
  DayAttendanceRow,
} from "@/features/attendance/types";
import { getApiErrorMessage } from "@/lib/api";
import {
  formatLocalDateDisplay,
  getSchoolTodayStr,
} from "@/lib/attendance-date";
import { ATTENDANCE_STATUS_CONFIG, AttendanceStatusIcon } from "./status-badge";

interface ClassOption {
  id: number;
  name: string;
}

interface SectionOption {
  id: number;
  name: string;
  classId: number;
}

interface TakeAttendanceTabProps {
  schoolId: number;
  isTeacher: boolean;
  classes: ClassOption[];
  sections: SectionOption[];
  selectedClassId: string;
  selectedSectionId: string;
  onClassChange: (classId: string) => void;
  onSectionChange: (sectionId: string) => void;
}

const STATUSES: readonly AttendanceStatus[] = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "EXCUSED",
];

function buildInitialDraft(rows: DayAttendanceRow[]) {
  const nextStatuses: Record<number, AttendanceStatus> = {};
  const nextRemarks: Record<number, string> = {};
  for (const row of rows) {
    if (row.existing) {
      nextStatuses[row.enrollmentId] = row.existing.status;
      nextRemarks[row.enrollmentId] = row.existing.remarks ?? "";
    } else if (row.suggestedStatus) {
      nextStatuses[row.enrollmentId] = row.suggestedStatus;
      nextRemarks[row.enrollmentId] = row.suggestedRemarks ?? "";
    } else {
      nextStatuses[row.enrollmentId] = "PRESENT";
      nextRemarks[row.enrollmentId] = "";
    }
  }
  return { nextStatuses, nextRemarks };
}

export function TakeAttendanceTab({
  schoolId,
  isTeacher,
  classes,
  sections,
  selectedClassId,
  selectedSectionId,
  onClassChange,
  onSectionChange,
}: TakeAttendanceTabProps) {
  const [date, setDate] = useState(() => getSchoolTodayStr());
  const [statuses, setStatuses] = useState<Record<number, AttendanceStatus>>(
    {},
  );
  const [remarksMap, setRemarksMap] = useState<Record<number, string>>({});
  const [baselineKey, setBaselineKey] = useState("");
  const [baselineStatuses, setBaselineStatuses] = useState<
    Record<number, AttendanceStatus>
  >({});
  const [baselineRemarks, setBaselineRemarks] = useState<
    Record<number, string>
  >({});

  const dayQuery = useDayAttendance(
    schoolId,
    {
      date,
      ...(selectedClassId ? { classId: Number(selectedClassId) } : {}),
      ...(selectedSectionId ? { sectionId: Number(selectedSectionId) } : {}),
    },
    schoolId > 0,
  );

  const bulkMut = useBulkMarkAttendance(schoolId);

  const rows = dayQuery.data?.rows ?? [];
  const dataFingerprint = useMemo(() => {
    if (!dayQuery.data) return "";
    return `${dayQuery.data.date}|${selectedClassId}|${selectedSectionId}|${rows
      .map(
        (r) =>
          `${r.enrollmentId}:${r.existing?.status ?? r.suggestedStatus ?? "NEW"}:${r.existing?.remarks ?? ""}`,
      )
      .join(",")}`;
  }, [dayQuery.data, selectedClassId, selectedSectionId, rows]);

  useEffect(() => {
    if (!dataFingerprint || dataFingerprint === baselineKey) return;
    const { nextStatuses, nextRemarks } = buildInitialDraft(rows);
    setStatuses(nextStatuses);
    setRemarksMap(nextRemarks);
    setBaselineStatuses(nextStatuses);
    setBaselineRemarks(nextRemarks);
    setBaselineKey(dataFingerprint);
  }, [dataFingerprint, baselineKey, rows]);

  const hasUnsavedChanges = useMemo(() => {
    if (rows.length === 0) return false;
    if (!dayQuery.data?.alreadyMarked) {
      // Unmarked day with students counts as dirty once user edits or if approved leave prefilled
      return rows.some(
        (r) =>
          statuses[r.enrollmentId] !== baselineStatuses[r.enrollmentId] ||
          (remarksMap[r.enrollmentId] ?? "").trim() !==
            (baselineRemarks[r.enrollmentId] ?? "").trim(),
      );
    }
    return rows.some(
      (r) =>
        statuses[r.enrollmentId] !== baselineStatuses[r.enrollmentId] ||
        (remarksMap[r.enrollmentId] ?? "").trim() !==
          (baselineRemarks[r.enrollmentId] ?? "").trim(),
    );
  }, [
    rows,
    statuses,
    remarksMap,
    baselineStatuses,
    baselineRemarks,
    dayQuery.data?.alreadyMarked,
  ]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedChanges]);

  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;
    for (const r of rows) {
      const st = statuses[r.enrollmentId] ?? "PRESENT";
      if (st === "PRESENT") present++;
      else if (st === "ABSENT") absent++;
      else if (st === "LATE") late++;
      else if (st === "EXCUSED") excused++;
    }
    return { present, absent, late, excused };
  }, [rows, statuses]);

  const isBlockedDay = Boolean(
    dayQuery.data &&
      (!dayQuery.data.isWorkingDay || !dayQuery.data.canEditDate),
  );

  const handleMarkAllPresent = () => {
    const next: Record<number, AttendanceStatus> = {};
    for (const r of rows) {
      next[r.enrollmentId] = "PRESENT";
    }
    setStatuses(next);
  };

  const handleSave = async () => {
    if (rows.length === 0 || isBlockedDay) return;

    const missingExcusedRemark = rows.find((r) => {
      const st = statuses[r.enrollmentId] ?? "PRESENT";
      return st === "EXCUSED" && !(remarksMap[r.enrollmentId] ?? "").trim();
    });

    if (missingExcusedRemark) {
      const name =
        `${missingExcusedRemark.student.firstName} ${missingExcusedRemark.student.lastName ?? ""}`.trim();
      toast.error(`Please enter a remark for ${name} (required for EXCUSED)`);
      return;
    }

    await bulkMut.mutateAsync({
      date,
      records: rows.map((r) => ({
        studentId: r.studentId,
        enrollmentId: r.enrollmentId,
        status: statuses[r.enrollmentId] ?? "PRESENT",
        ...(remarksMap[r.enrollmentId]?.trim()
          ? { remarks: remarksMap[r.enrollmentId].trim() }
          : {}),
      })),
    });

    setBaselineStatuses({ ...statuses });
    setBaselineRemarks({ ...remarksMap });
  };

  return (
    <div className="space-y-4 pb-24 md:pb-4">
      {/* Filter Bar */}
      <div className="mobile-filter-bar">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Class</Label>
          <select
            value={selectedClassId}
            onChange={(e) => onClassChange(e.target.value)}
            className="h-10 w-full rounded-[11px] border bg-background px-3 text-sm sm:h-9 sm:w-auto"
          >
            <option value="">
              {isTeacher ? "All My Assigned Classes" : "All Classes"}
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
            onChange={(e) => onSectionChange(e.target.value)}
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
          <Label
            htmlFor="take-att-date"
            className="text-xs text-muted-foreground"
          >
            Date (Asia/Dhaka)
          </Label>
          <Input
            id="take-att-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 w-full rounded-[11px] sm:h-9 sm:w-44"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:ml-auto sm:flex sm:flex-wrap">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleMarkAllPresent}
            disabled={rows.length === 0 || isBlockedDay}
            className="min-h-[44px] gap-1.5 rounded-[11px] sm:min-h-0"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All Present
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={bulkMut.isPending || rows.length === 0 || isBlockedDay}
            className="min-h-[44px] gap-1.5 rounded-[11px] sm:min-h-0"
          >
            <Check className="h-4 w-4" />
            {bulkMut.isPending ? "Saving..." : "Save & Notify"}
          </Button>
        </div>
      </div>

      {/* Status & Counter Strip */}
      {dayQuery.data && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[11px] border bg-card px-3.5 py-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground">
              {formatLocalDateDisplay(dayQuery.data.date)}
            </span>
            {dayQuery.data.alreadyMarked ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                <Info className="h-3 w-3" />
                Already Marked — Editing
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-muted bg-muted/50 px-2.5 py-0.5 font-medium text-muted-foreground">
                Not Yet Marked
              </span>
            )}
            {hasUnsavedChanges && (
              <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                Unsaved changes
              </span>
            )}
          </div>

          {rows.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 font-medium">
              <span className="text-emerald-700 dark:text-emerald-400">
                {counts.present} Present
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-red-700 dark:text-red-400">
                {counts.absent} Absent
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-amber-700 dark:text-amber-400">
                {counts.late} Late
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-blue-700 dark:text-blue-400">
                {counts.excused} Excused
              </span>
            </div>
          )}
        </div>
      )}

      {/* Non-Working Day or Teacher Edit Window Banners */}
      {dayQuery.data && !dayQuery.data.isWorkingDay && (
        <div className="flex items-start gap-2.5 rounded-[11px] border border-amber-300 bg-amber-50 p-3.5 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <CalendarOff className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">
              {dayQuery.data.isHoliday
                ? `School Holiday: ${dayQuery.data.holidayTitle}`
                : "Weekly-Off Day"}
            </p>
            <p className="mt-0.5 text-xs opacity-90">
              Attendance cannot be marked on non-working days. Update holidays
              or weekly-off settings if this day should be a working day.
            </p>
          </div>
        </div>
      )}

      {dayQuery.data?.isWorkingDay && !dayQuery.data.canEditDate && (
        <div className="flex items-start gap-2.5 rounded-[11px] border border-red-300 bg-red-50 p-3.5 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Outside Teacher Edit Window</p>
            <p className="mt-0.5 text-xs opacity-90">
              Teachers can only mark or edit attendance for today and the
              previous 3 days. Please contact an Admin or Manager for older
              dates.
            </p>
          </div>
        </div>
      )}

      {/* Loading / Error / Empty / Roster */}
      {dayQuery.isLoading ? (
        <LoadingState message="Loading class roster and attendance..." />
      ) : dayQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(
            dayQuery.error,
            "Failed to load attendance roster",
          )}
          onRetry={() => dayQuery.refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No active students found"
          description="Select a class/section with active enrollments to take attendance."
        />
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="space-y-2.5 md:hidden">
            {rows.map((row) => {
              const currentStatus = statuses[row.enrollmentId] ?? "PRESENT";
              const remark = remarksMap[row.enrollmentId] ?? "";
              const needsRemark = currentStatus === "EXCUSED" && !remark.trim();
              return (
                <div key={row.enrollmentId} className="mobile-card space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {row.student.firstName} {row.student.lastName ?? ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.class.name}
                        {row.section ? ` • ${row.section.name}` : ""}
                        {row.rollNumber ? ` • Roll #${row.rollNumber}` : ""}
                      </p>
                      {row.approvedLeave && (
                        <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                          Approved Leave: {row.approvedLeave.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {STATUSES.map((st) => {
                      const cfg = ATTENDANCE_STATUS_CONFIG[st];
                      const active = currentStatus === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          disabled={isBlockedDay}
                          onClick={() =>
                            setStatuses((prev) => ({
                              ...prev,
                              [row.enrollmentId]: st,
                            }))
                          }
                          className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-[11px] border px-1.5 py-1 text-xs font-semibold transition disabled:opacity-50 ${
                            active
                              ? cfg.activeBtnClass
                              : "bg-background text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <AttendanceStatusIcon
                              status={st}
                              className="h-3.5 w-3.5"
                            />
                            {cfg.code}
                          </span>
                          <span className="text-[10px] font-medium">
                            {cfg.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <Input
                    value={remark}
                    disabled={isBlockedDay}
                    onChange={(e) =>
                      setRemarksMap((prev) => ({
                        ...prev,
                        [row.enrollmentId]: e.target.value,
                      }))
                    }
                    placeholder={
                      currentStatus === "EXCUSED"
                        ? "Remark required for Excused *"
                        : "Remarks (optional, e.g. 15m late)"
                    }
                    className={`h-10 rounded-[11px] text-xs ${
                      needsRemark
                        ? "border-red-400 focus-visible:ring-red-400"
                        : ""
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="surface-panel hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5">Student</th>
                  <th className="px-4 py-2.5">Class / Section</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => {
                  const currentStatus = statuses[row.enrollmentId] ?? "PRESENT";
                  const remark = remarksMap[row.enrollmentId] ?? "";
                  const needsRemark =
                    currentStatus === "EXCUSED" && !remark.trim();
                  return (
                    <tr key={row.enrollmentId}>
                      <td className="px-4 py-2.5">
                        <div className="font-medium">
                          {row.student.firstName} {row.student.lastName ?? ""}
                          {row.rollNumber ? (
                            <span className="ml-2 text-xs text-muted-foreground">
                              Roll #{row.rollNumber}
                            </span>
                          ) : null}
                        </div>
                        {row.approvedLeave && (
                          <span className="mt-0.5 inline-block rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                            Approved Leave: {row.approvedLeave.reason}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {row.class.name}
                        {row.section ? ` — ${row.section.name}` : ""}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-wrap gap-1.5">
                          {STATUSES.map((st) => {
                            const cfg = ATTENDANCE_STATUS_CONFIG[st];
                            const active = currentStatus === st;
                            return (
                              <button
                                key={st}
                                type="button"
                                disabled={isBlockedDay}
                                onClick={() =>
                                  setStatuses((prev) => ({
                                    ...prev,
                                    [row.enrollmentId]: st,
                                  }))
                                }
                                className={`inline-flex items-center gap-1 rounded-[9px] border px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
                                  active
                                    ? cfg.activeBtnClass
                                    : "bg-background text-muted-foreground hover:bg-muted"
                                }`}
                              >
                                <AttendanceStatusIcon
                                  status={st}
                                  className="h-3 w-3"
                                />
                                <span>{cfg.code}</span>
                                <span className="hidden lg:inline">
                                  {cfg.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <Input
                          value={remark}
                          disabled={isBlockedDay}
                          onChange={(e) =>
                            setRemarksMap((prev) => ({
                              ...prev,
                              [row.enrollmentId]: e.target.value,
                            }))
                          }
                          placeholder={
                            currentStatus === "EXCUSED"
                              ? "Remark required *"
                              : "e.g. Arrived 15m late"
                          }
                          className={`h-8 text-xs ${
                            needsRemark
                              ? "border-red-400 focus-visible:ring-red-400"
                              : ""
                          }`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Sticky Mobile Bottom Save Bar */}
          {!isBlockedDay && (
            <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-3.5 py-2.5 backdrop-blur-sm md:hidden">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-medium leading-tight">
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {counts.present}P
                  </span>{" "}
                  •{" "}
                  <span className="text-red-700 dark:text-red-400">
                    {counts.absent}A
                  </span>{" "}
                  •{" "}
                  <span className="text-amber-700 dark:text-amber-400">
                    {counts.late}L
                  </span>{" "}
                  •{" "}
                  <span className="text-blue-700 dark:text-blue-400">
                    {counts.excused}E
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSave}
                  disabled={bulkMut.isPending}
                  className="min-h-[44px] gap-1.5 rounded-[11px] px-4"
                >
                  <Check className="h-4 w-4" />
                  {bulkMut.isPending ? "Saving..." : "Save & Notify"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
