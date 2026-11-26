"use client";

import { BarChart3, Download, Printer, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useMonthlyReport,
  usePublishMonthlyReport,
} from "@/features/attendance/hooks";
import { getApiErrorMessage } from "@/lib/api";
import {
  formatMonthLabel,
  getSchoolCurrentMonthStr,
} from "@/lib/attendance-date";

interface AttendanceReportsTabProps {
  schoolId: number;
  classes: Array<{ id: number; name: string }>;
  allSections: Array<{ id: number; name: string; classId: number }>;
}

export function AttendanceReportsTab({
  schoolId,
  classes,
  allSections,
}: AttendanceReportsTabProps) {
  const [month, setMonth] = useState(() => getSchoolCurrentMonthStr());
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");

  useEffect(() => {
    if (!classId && classes.length > 0) {
      setClassId(String(classes[0].id));
    }
  }, [classId, classes]);

  const classSections = allSections.filter(
    (s) => s.classId === Number(classId),
  );

  const reportQuery = useMonthlyReport(
    schoolId,
    {
      month,
      classId: Number(classId),
      ...(sectionId ? { sectionId: Number(sectionId) } : {}),
    },
    Boolean(classId && month),
  );

  const publishMut = usePublishMonthlyReport(schoolId);
  const report = reportQuery.data;

  const handleExportCsv = () => {
    if (!report) return;
    const headers = [
      "Roll",
      "Student ID",
      "Student Name",
      "Present",
      "Absent",
      "Late",
      "Excused",
      "Working Days",
      "Attendance %",
    ];
    const lines = [
      headers.join(","),
      ...report.rows.map((r) =>
        [
          r.rollNumber ?? "",
          `"${r.studentCode}"`,
          `"${`${r.firstName} ${r.lastName ?? ""}`.trim().replace(/"/g, '""')}"`,
          r.present,
          r.absent,
          r.late,
          r.excused,
          r.workingDays,
          `${r.percent}%`,
        ].join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${report.month}-${report.class.name.replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePublish = async () => {
    if (!classId || !month) return;
    await publishMut.mutateAsync({
      month,
      classId: Number(classId),
      ...(sectionId ? { sectionId: Number(sectionId) } : {}),
    });
  };

  return (
    <div className="space-y-4">
      {/* Controls (Hidden when printing) */}
      <div className="mobile-filter-bar no-print">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Month</Label>
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-10 w-full rounded-[11px] sm:h-9 sm:w-44"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Class *</Label>
          <select
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setSectionId("");
            }}
            className="h-10 w-full rounded-[11px] border bg-background px-3 text-sm sm:h-9 sm:w-auto"
          >
            <option value="">Select class...</option>
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
            value={sectionId}
            disabled={!classId}
            onChange={(e) => setSectionId(e.target.value)}
            className="h-10 w-full rounded-[11px] border bg-background px-3 text-sm disabled:opacity-50 sm:h-9 sm:w-auto"
          >
            <option value="">All Sections</option>
            {classSections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {report && (
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleExportCsv}
              disabled={report.rows.length === 0}
              className="min-h-[40px] gap-1.5 rounded-[11px] sm:min-h-0"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              disabled={report.rows.length === 0}
              className="min-h-[40px] gap-1.5 rounded-[11px] sm:min-h-0"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / PDF
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handlePublish}
              disabled={publishMut.isPending || report.rows.length === 0}
              className="min-h-[40px] gap-1.5 rounded-[11px] sm:min-h-0"
            >
              <Send className="h-3.5 w-3.5" />
              {publishMut.isPending
                ? "Publishing..."
                : report.status === "PUBLISHED"
                  ? "Re-Publish & Notify"
                  : "Publish to Guardians"}
            </Button>
          </div>
        )}
      </div>

      {!classId ? (
        <EmptyState
          icon={BarChart3}
          title="Select a class to view monthly report"
          description="Choose a month and class to generate live attendance percentages."
        />
      ) : reportQuery.isLoading ? (
        <LoadingState message="Calculating monthly report..." />
      ) : reportQuery.isError ? (
        <ErrorState
          message={getApiErrorMessage(
            reportQuery.error,
            "Failed to load monthly report",
          )}
          onRetry={() => reportQuery.refetch()}
        />
      ) : !report ? null : (
        <div className="print-report-sheet space-y-5">
          {/* Header with Draft/Published Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
            <div>
              <h2 className="text-lg font-bold">
                Monthly Attendance Report — {formatMonthLabel(report.month)}
              </h2>
              <p className="text-xs text-muted-foreground">
                {report.class.name}
                {report.section ? ` • Section ${report.section.name}` : ""} •{" "}
                {report.workingDays} Working Day(s)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  report.status === "PUBLISHED"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                {report.status === "PUBLISHED" ? "Published" : "Draft"}
              </span>
              {report.publishedAt && (
                <span className="text-xs text-muted-foreground">
                  {new Date(report.publishedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-5">
            <ReportStatCard
              label="Class Avg %"
              value={`${report.totals.averagePercent}%`}
              accent="text-emerald-600"
            />
            <ReportStatCard
              label="Working Days"
              value={String(report.workingDays)}
            />
            <ReportStatCard
              label="Total Present"
              value={String(report.totals.present)}
              accent="text-emerald-600"
            />
            <ReportStatCard
              label="Total Absent"
              value={String(report.totals.absent)}
              accent="text-red-600"
            />
            <ReportStatCard
              label="Late / Excused"
              value={`${report.totals.late} / ${report.totals.excused}`}
              accent="text-amber-600"
            />
          </div>

          {/* Present % Bar Chart */}
          {report.rows.length > 0 && (
            <div className="surface-panel p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Student Attendance Rate (%)
                </h3>
                <span className="text-xs text-muted-foreground">
                  Formula: (Present + Late) / (Working Days − Excused)
                </span>
              </div>
              <div className="space-y-2">
                {report.rows.map((r) => {
                  const barColor =
                    r.percent >= 85
                      ? "bg-emerald-500"
                      : r.percent >= 70
                        ? "bg-amber-500"
                        : "bg-red-500";
                  return (
                    <div
                      key={r.studentId}
                      className="grid grid-cols-[minmax(120px,180px)_1fr_48px] items-center gap-3 text-xs"
                    >
                      <span className="truncate font-medium">
                        {r.rollNumber ? `#${r.rollNumber} ` : ""}
                        {r.firstName} {r.lastName ?? ""}
                      </span>
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${Math.min(100, r.percent)}%` }}
                        />
                      </div>
                      <span className="text-right font-semibold tabular-nums">
                        {r.percent}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Per-Student Table */}
          {report.rows.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No active students in this class"
              description="Enroll students into this class to see monthly attendance totals."
            />
          ) : (
            <div className="surface-panel overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5">Roll</th>
                    <th className="px-4 py-2.5">Student</th>
                    <th className="px-3 py-2.5 text-center">Present</th>
                    <th className="px-3 py-2.5 text-center">Absent</th>
                    <th className="px-3 py-2.5 text-center">Late</th>
                    <th className="px-3 py-2.5 text-center">Excused</th>
                    <th className="px-3 py-2.5 text-center">Working</th>
                    <th className="px-4 py-2.5 text-right">Rate %</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.rows.map((r) => (
                    <tr key={r.studentId}>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {r.rollNumber ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 font-medium">
                        {r.firstName} {r.lastName ?? ""}
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({r.studentCode})
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center text-emerald-700 dark:text-emerald-400">
                        {r.present}
                      </td>
                      <td className="px-3 py-2.5 text-center text-red-700 dark:text-red-400">
                        {r.absent}
                      </td>
                      <td className="px-3 py-2.5 text-center text-amber-700 dark:text-amber-400">
                        {r.late}
                      </td>
                      <td className="px-3 py-2.5 text-center text-blue-700 dark:text-blue-400">
                        {r.excused}
                      </td>
                      <td className="px-3 py-2.5 text-center text-muted-foreground">
                        {r.workingDays}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                        {r.percent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReportStatCard({
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
      <p className={`mt-1 text-xl font-bold ${accent ?? "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
