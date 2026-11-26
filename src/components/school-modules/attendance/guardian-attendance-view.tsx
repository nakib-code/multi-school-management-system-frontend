"use client";

import {
  CalendarCheck,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  FileText,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCancelLeaveRequest,
  useCreateLeaveRequest,
  useLeaveRequests,
  useMyLinkedStudents,
  usePublishedReports,
  useStudentCalendar,
} from "@/features/attendance/hooks";
import type { LeaveRequestStatus } from "@/features/attendance/types";
import { getApiErrorMessage } from "@/lib/api";
import {
  formatLocalDateDisplay,
  formatMonthLabel,
  getSchoolCurrentMonthStr,
  getSchoolTodayStr,
  shiftMonthStr,
} from "@/lib/attendance-date";
import {
  ATTENDANCE_STATUS_CONFIG,
  AttendanceStatusBadge,
  AttendanceStatusIcon,
} from "./status-badge";

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const LEAVE_STATUS_BADGE: Record<LeaveRequestStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
};

interface GuardianAttendanceViewProps {
  schoolId: number;
  isGuardian: boolean;
}

export function GuardianAttendanceView({
  schoolId,
  isGuardian,
}: GuardianAttendanceViewProps) {
  const [month, setMonth] = useState(() => getSchoolCurrentMonthStr());
  const [selectedStudentId, setSelectedStudentId] = useState<
    number | undefined
  >(undefined);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveStudentId, setLeaveStudentId] = useState("");
  const [leaveFrom, setLeaveFrom] = useState(() => getSchoolTodayStr());
  const [leaveTo, setLeaveTo] = useState(() => getSchoolTodayStr());
  const [leaveReason, setLeaveReason] = useState("");

  const linkedStudentsQuery = useMyLinkedStudents(schoolId);
  const linkedStudents = linkedStudentsQuery.data ?? [];

  useEffect(() => {
    if (selectedStudentId === undefined && linkedStudents.length > 0) {
      setSelectedStudentId(linkedStudents[0].id);
    }
  }, [selectedStudentId, linkedStudents]);

  const calendarQuery = useStudentCalendar(
    schoolId,
    {
      month,
      ...(selectedStudentId ? { studentId: selectedStudentId } : {}),
    },
    {
      enabled: schoolId > 0 && linkedStudents.length > 0,
      autoRefresh: true,
    },
  );

  const leavesQuery = useLeaveRequests(
    schoolId,
    selectedStudentId ? { studentId: selectedStudentId } : undefined,
    { enabled: schoolId > 0 && linkedStudents.length > 0, autoRefresh: true },
  );

  const publishedReportsQuery = usePublishedReports(
    schoolId,
    selectedStudentId,
    schoolId > 0 && linkedStudents.length > 0,
  );

  const createLeaveMut = useCreateLeaveRequest(schoolId);
  const cancelLeaveMut = useCancelLeaveRequest(schoolId);

  const cal = calendarQuery.data;

  // Compute leading empty cells for calendar grid (Sun = 0)
  const leadingEmptyDays = useMemo(() => {
    if (!cal || cal.days.length === 0) return 0;
    const [y, m] = cal.month.split("-").map(Number);
    if (!y || !m) return 0;
    return new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  }, [cal]);

  const nonPresentDays = useMemo(() => {
    if (!cal) return [];
    return cal.days.filter(
      (d) =>
        d.status === "ABSENT" || d.status === "LATE" || d.status === "EXCUSED",
    );
  }, [cal]);

  const rateDelta = useMemo(() => {
    if (!cal) return 0;
    return Math.round((cal.summary.rate - cal.previousMonth.rate) * 10) / 10;
  }, [cal]);

  const openLeaveModal = () => {
    const today = getSchoolTodayStr();
    setLeaveStudentId(
      selectedStudentId
        ? String(selectedStudentId)
        : linkedStudents[0]
          ? String(linkedStudents[0].id)
          : "",
    );
    setLeaveFrom(today);
    setLeaveTo(today);
    setLeaveReason("");
    setLeaveModalOpen(true);
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStudentId) return;
    await createLeaveMut.mutateAsync({
      studentId: Number(leaveStudentId),
      fromDate: leaveFrom,
      toDate: leaveTo,
      reason: leaveReason.trim(),
    });
    setLeaveModalOpen(false);
  };

  if (linkedStudentsQuery.isLoading) {
    return <LoadingState message="Loading student attendance sheet..." />;
  }
  if (linkedStudentsQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          linkedStudentsQuery.error,
          "Failed to load linked students",
        )}
        onRetry={() => linkedStudentsQuery.refetch()}
      />
    );
  }
  if (linkedStudents.length === 0) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title="No linked student profile found"
        description="Please contact the school office to link your child's student profile."
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Controls: Child Switcher + Month Picker + Request Leave */}
      <div className="mobile-filter-bar">
        {linkedStudents.length > 1 && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Child</Label>
            <select
              value={selectedStudentId ?? ""}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
              className="h-10 w-full rounded-[11px] border bg-background px-3 text-sm sm:h-9 sm:w-auto"
            >
              {linkedStudents.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.firstName} {st.lastName ?? ""}
                  {st.activeEnrollment?.class
                    ? ` (${st.activeEnrollment.class.name})`
                    : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Month</Label>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setMonth((m) => shiftMonthStr(m, -1))}
              aria-label="Previous month"
              className="h-10 w-10 rounded-[11px] p-0 sm:h-9 sm:w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="h-10 flex-1 rounded-[11px] sm:h-9 sm:w-40 sm:flex-none"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setMonth((m) => shiftMonthStr(m, 1))}
              aria-label="Next month"
              className="h-10 w-10 rounded-[11px] p-0 sm:h-9 sm:w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isGuardian && (
          <div className="sm:ml-auto">
            <Button
              type="button"
              size="sm"
              onClick={openLeaveModal}
              className="min-h-[44px] w-full gap-1.5 rounded-[11px] sm:min-h-0 sm:w-auto"
            >
              <CalendarPlus className="h-4 w-4" />
              Request Leave
            </Button>
          </div>
        )}
      </div>

      {/* Calendar & Summary */}
      {calendarQuery.isLoading ? (
        <LoadingState message="Loading monthly calendar..." />
      ) : calendarQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(
            calendarQuery.error,
            "Failed to load attendance calendar",
          )}
          onRetry={() => calendarQuery.refetch()}
        />
      ) : cal ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            <div className="surface-panel p-3.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Attendance Rate
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-600">
                {cal.summary.rate}%
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                {rateDelta >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span>
                  {rateDelta >= 0 ? "+" : ""}
                  {rateDelta}% vs {formatMonthLabel(cal.previousMonth.month)}
                </span>
              </p>
            </div>
            <MiniStat
              label="Working Days"
              value={String(cal.summary.workingDays)}
            />
            <MiniStat
              label="Present"
              value={String(cal.summary.present)}
              accent="text-emerald-600"
            />
            <MiniStat
              label="Absent"
              value={String(cal.summary.absent)}
              accent="text-red-600"
            />
            <MiniStat
              label="Late"
              value={String(cal.summary.late)}
              accent="text-amber-600"
            />
            <MiniStat
              label="Excused"
              value={String(cal.summary.excused)}
              accent="text-blue-600"
            />
          </div>

          {/* Monthly Calendar Grid */}
          <div className="surface-panel space-y-3 p-3.5 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">
                {formatMonthLabel(cal.month)}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />P
                  Present
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />A
                  Absent
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />L
                  Late
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />E
                  Excused
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                  Off / Holiday
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground sm:gap-2">
              {WEEKDAY_HEADERS.map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {WEEKDAY_HEADERS.slice(0, leadingEmptyDays).map((dayName) => (
                <div
                  key={`pad-${dayName}`}
                  className="min-h-[54px] sm:min-h-[68px]"
                />
              ))}

              {cal.days.map((cell) => {
                const dayNum = Number(cell.date.slice(8, 10));
                const isToday = cell.date === cal.today;
                const statusCfg = cell.status
                  ? ATTENDANCE_STATUS_CONFIG[cell.status]
                  : null;

                let cellBg = "border-border bg-card text-foreground";
                if (statusCfg) {
                  cellBg = statusCfg.calendarClass;
                } else if (cell.isHoliday || cell.isWeeklyOff) {
                  cellBg =
                    "border-dashed border-muted-foreground/30 bg-muted/50 text-muted-foreground";
                } else if (cell.isFuture) {
                  cellBg =
                    "border-border/50 bg-background/50 text-muted-foreground/60";
                }

                return (
                  <div
                    key={cell.date}
                    title={
                      cell.holidayTitle
                        ? `Holiday: ${cell.holidayTitle}`
                        : cell.remarks
                          ? `${cell.status}: ${cell.remarks}`
                          : (cell.status ??
                            (cell.isWeeklyOff ? "Weekly Off" : ""))
                    }
                    className={`flex min-h-[54px] flex-col justify-between rounded-[9px] border p-1.5 text-left sm:min-h-[68px] sm:p-2 ${cellBg} ${
                      isToday ? "ring-2 ring-primary ring-offset-1" : ""
                    }`}
                  >
                    <span className="text-[11px] font-semibold leading-none">
                      {dayNum}
                    </span>

                    <div className="mt-1 flex items-center justify-between gap-0.5">
                      {statusCfg && cell.status ? (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold">
                          <AttendanceStatusIcon
                            status={cell.status}
                            className="h-3 w-3 shrink-0"
                          />
                          <span>{statusCfg.code}</span>
                        </span>
                      ) : cell.isHoliday ? (
                        <span className="truncate text-[10px] font-medium">
                          {cell.holidayTitle ?? "Holiday"}
                        </span>
                      ) : cell.isWeeklyOff ? (
                        <span className="text-[10px] font-medium">Off</span>
                      ) : (
                        <span className="text-[10px] opacity-40">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Non-Present Days with Remarks */}
          <div className="surface-panel space-y-3 p-4">
            <h3 className="text-sm font-semibold">
              Absent, Late &amp; Excused Days ({nonPresentDays.length})
            </h3>
            {nonPresentDays.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No absences, late arrivals, or excused leaves recorded in{" "}
                {formatMonthLabel(cal.month)}.
              </p>
            ) : (
              <div className="divide-y">
                {nonPresentDays.map((d) => (
                  <div
                    key={d.date}
                    className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {formatLocalDateDisplay(d.date)}
                      </p>
                      {d.remarks && (
                        <p className="text-xs text-muted-foreground">
                          {d.remarks}
                        </p>
                      )}
                    </div>
                    {d.status && <AttendanceStatusBadge status={d.status} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Leave Requests History + Published Monthly Reports */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Leave Requests */}
        <div className="surface-panel space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Leave Requests</h3>
            {isGuardian && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={openLeaveModal}
                className="h-8 gap-1 rounded-[9px] text-xs"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                New
              </Button>
            )}
          </div>

          {(leavesQuery.data ?? []).length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No leave requests submitted yet.
            </p>
          ) : (
            <div className="space-y-2">
              {(leavesQuery.data ?? []).map((lr) => (
                <div
                  key={lr.id}
                  className="rounded-[10px] border bg-muted/20 p-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">
                      {formatLocalDateDisplay(lr.fromDate)} →{" "}
                      {formatLocalDateDisplay(lr.toDate)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${LEAVE_STATUS_BADGE[lr.status]}`}
                      >
                        {lr.status}
                      </span>
                      {isGuardian && lr.status === "PENDING" && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={cancelLeaveMut.isPending}
                          onClick={() => cancelLeaveMut.mutate(lr.id)}
                          className="h-6 px-1.5 text-[11px] text-destructive"
                        >
                          <X className="mr-0.5 h-3 w-3" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-muted-foreground">{lr.reason}</p>
                  {lr.reviewNote && (
                    <p className="mt-1 text-[11px] text-foreground">
                      School note: {lr.reviewNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Published Monthly Reports */}
        <div className="surface-panel space-y-3 p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Published Monthly Reports</h3>
          </div>

          {(publishedReportsQuery.data ?? []).length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No monthly attendance reports have been published yet.
            </p>
          ) : (
            <div className="space-y-2">
              {(publishedReportsQuery.data ?? []).map((rep) => (
                <div
                  key={`${rep.reportId}-${rep.student.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border bg-muted/20 p-3 text-xs"
                >
                  <div>
                    <p className="font-semibold">
                      {formatMonthLabel(rep.month)} — {rep.student.firstName}{" "}
                      {rep.student.lastName ?? ""}
                    </p>
                    <p className="text-muted-foreground">
                      {rep.class.name}
                      {rep.section ? ` (${rep.section.name})` : ""} •{" "}
                      {rep.present}P / {rep.absent}A / {rep.late}L /{" "}
                      {rep.excused}E ({rep.workingDays} working days)
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    {rep.percent}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Request Leave Modal */}
      <Modal
        open={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Request Student Leave"
        description="Submit a leave request (up to 30 days). Approved leaves are automatically highlighted during daily attendance."
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSubmitLeave} className="space-y-4">
          <div className="space-y-1">
            <Label>Child *</Label>
            <select
              required
              value={leaveStudentId}
              onChange={(e) => setLeaveStudentId(e.target.value)}
              className="h-10 w-full rounded-[11px] border bg-background px-3 text-sm"
            >
              {linkedStudents.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.firstName} {st.lastName ?? ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="leave-from">From Date *</Label>
              <Input
                id="leave-from"
                type="date"
                required
                min={getSchoolTodayStr()}
                value={leaveFrom}
                onChange={(e) => {
                  setLeaveFrom(e.target.value);
                  if (leaveTo < e.target.value) setLeaveTo(e.target.value);
                }}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="leave-to">To Date *</Label>
              <Input
                id="leave-to"
                type="date"
                required
                min={leaveFrom}
                value={leaveTo}
                onChange={(e) => setLeaveTo(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="leave-reason">Reason *</Label>
            <textarea
              id="leave-reason"
              required
              minLength={3}
              rows={3}
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="e.g. Fever / family travel..."
              className="w-full rounded-[11px] border bg-background p-2.5 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLeaveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createLeaveMut.isPending}>
              {createLeaveMut.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="surface-panel p-3.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-bold ${accent ?? "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
