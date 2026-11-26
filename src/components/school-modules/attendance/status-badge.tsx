"use client";

import { CheckCircle2, Clock, FileCheck2, XCircle } from "lucide-react";
import type { AttendanceStatus } from "@/features/attendance/types";

export const ATTENDANCE_STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    code: string;
    label: string;
    pillClass: string;
    activeBtnClass: string;
    calendarClass: string;
  }
> = {
  PRESENT: {
    code: "P",
    label: "Present",
    pillClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
    activeBtnClass: "border-emerald-500 bg-emerald-600 text-white shadow-xs",
    calendarClass:
      "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200",
  },
  ABSENT: {
    code: "A",
    label: "Absent",
    pillClass:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300",
    activeBtnClass: "border-red-500 bg-red-600 text-white shadow-xs",
    calendarClass:
      "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/60 dark:text-red-200",
  },
  LATE: {
    code: "L",
    label: "Late",
    pillClass:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    activeBtnClass: "border-amber-500 bg-amber-500 text-white shadow-xs",
    calendarClass:
      "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
  },
  EXCUSED: {
    code: "E",
    label: "Excused",
    pillClass:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
    activeBtnClass: "border-blue-500 bg-blue-600 text-white shadow-xs",
    calendarClass:
      "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200",
  },
};

export function AttendanceStatusIcon({
  status,
  className = "h-3.5 w-3.5",
}: {
  status: AttendanceStatus;
  className?: string;
}) {
  if (status === "PRESENT") return <CheckCircle2 className={className} />;
  if (status === "ABSENT") return <XCircle className={className} />;
  if (status === "LATE") return <Clock className={className} />;
  return <FileCheck2 className={className} />;
}

export function AttendanceStatusBadge({
  status,
}: {
  status: AttendanceStatus;
}) {
  const cfg = ATTENDANCE_STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.pillClass}`}
    >
      <AttendanceStatusIcon status={status} className="h-3 w-3 shrink-0" />
      <span>{cfg.label}</span>
    </span>
  );
}
