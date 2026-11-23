"use client";

import { CalendarCheck, Check, Trash2 } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAttendances,
  useBulkMarkAttendance,
  useDeleteAttendance,
} from "@/features/attendance/hooks";
import type { AttendanceStatus } from "@/features/attendance/types";
import { useEnrollments } from "@/features/enrollments/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function AttendanceWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const canMark =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "TEACHER";
  const canDelete = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [tab, setTab] = useState<"records" | "mark">("records");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState<Record<number, AttendanceStatus>>({});

  const recordsQuery = useAttendances(schoolId);
  const enrollmentsQuery = useEnrollments(canMark ? schoolId : 0, {
    status: "ACTIVE",
  });
  const bulkMut = useBulkMarkAttendance(schoolId);
  const deleteMut = useDeleteAttendance(schoolId);

  if (recordsQuery.isLoading) return <LoadingState message="Loading attendance..." />;
  if (recordsQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(recordsQuery.error, "Failed to load attendance")}
        onRetry={() => recordsQuery.refetch()}
      />
    );
  }

  const records = recordsQuery.data ?? [];
  const activeEnrollments = enrollmentsQuery.data ?? [];

  const handleBulkSave = async () => {
    if (activeEnrollments.length === 0) return;
    await bulkMut.mutateAsync({
      date,
      records: activeEnrollments.map((en) => ({
        studentId: en.studentId,
        enrollmentId: en.id,
        status: statuses[en.id] ?? "PRESENT",
      })),
    });
    setTab("records");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {canMark
            ? "Mark daily attendance in bulk and review attendance logs."
            : "View daily attendance history."}
        </p>
      </div>

      {canMark && (
        <div className="flex gap-2 border-b">
          <button
            type="button"
            onClick={() => setTab("records")}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === "records"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Attendance Records ({records.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("mark")}
            className={`border-b-2 px-4 py-2 text-sm font-medium ${
              tab === "mark"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Mark Bulk Attendance
          </button>
        </div>
      )}

      {tab === "mark" && canMark ? (
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="att-date">Attendance Date</Label>
              <Input
                id="att-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <Button
              onClick={handleBulkSave}
              disabled={bulkMut.isPending || activeEnrollments.length === 0}
              className="gap-1.5"
            >
              <Check className="h-4 w-4" />
              {bulkMut.isPending ? "Saving..." : "Save Bulk Attendance"}
            </Button>
          </div>

          {activeEnrollments.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No active enrollments"
              description="Enroll students first before marking attendance."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5">Student</th>
                    <th className="px-4 py-2.5">Class / Section</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activeEnrollments.map((en) => (
                    <tr key={en.id}>
                      <td className="px-4 py-2.5 font-medium">
                        {en.student
                          ? `${en.student.firstName} ${en.student.lastName ?? ""}`
                          : `Student #${en.studentId}`}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {en.class?.name ?? en.classId}
                        {en.section ? ` — ${en.section.name}` : ""}
                      </td>
                      <td className="px-4 py-2.5">
                        <select
                          value={statuses[en.id] ?? "PRESENT"}
                          onChange={(e) =>
                            setStatuses({
                              ...statuses,
                              [en.id]: e.target.value as AttendanceStatus,
                            })
                          }
                          className="h-8 rounded-md border bg-background px-2 text-xs"
                        >
                          <option value="PRESENT">PRESENT</option>
                          <option value="ABSENT">ABSENT</option>
                          <option value="LATE">LATE</option>
                          <option value="EXCUSED">EXCUSED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No attendance records yet"
          description="Daily student attendance logs will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Status</th>
                {canDelete && <th className="px-4 py-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-xs">
                    {new Date(r.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {r.student
                      ? `${r.student.firstName} ${r.student.lastName ?? ""}`
                      : `Student #${r.studentId}`}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.enrollment?.class?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
                      {r.status}
                    </span>
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
      )}
    </div>
  );
}
