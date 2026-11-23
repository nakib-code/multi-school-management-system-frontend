"use client";

import { BookOpenCheck, Plus } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateHefzEnrollment,
  useGuardianHefzProgress,
  useHefzDailyLogs,
  useHefzEnrollments,
  useStudentHefzProgress,
  useUpsertHefzDailyLog,
} from "@/features/hefz/hooks";
import type {
  HefzAttendanceStatus,
  HefzWing,
  SobokQuality,
} from "@/features/hefz/types";
import { useMyStudentProfile, useStudents } from "@/features/students/hooks";
import { useTeachers } from "@/features/teachers/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function HefzWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const role = user?.role ?? "";

  if (role === "GUARDIAN") {
    return <GuardianHefzView schoolId={schoolId} />;
  }
  if (role === "STUDENT") {
    return <StudentHefzView schoolId={schoolId} />;
  }

  return <StaffHefzView schoolId={schoolId} canEnroll={role === "ADMIN" || role === "MANAGER"} />;
}

function GuardianHefzView({ schoolId }: { schoolId: number }) {
  const { data, isLoading, isError, error, refetch } = useGuardianHefzProgress(schoolId);
  if (isLoading) return <LoadingState message="Loading children's Hefz progress..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load Hefz progress")}
        onRetry={() => refetch()}
      />
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hefz &amp; Najera Progress</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daily Sobok, Sobok-e-Am, and Manzil memorization updates for your linked children.
        </p>
      </div>
      {!data || (Array.isArray(data) && data.length === 0) ? (
        <EmptyState
          icon={BookOpenCheck}
          title="No Hefz progress records yet"
          description="Once your child is enrolled in the Hefz or Najera wing, daily logs will appear here."
        />
      ) : (
        <pre className="overflow-x-auto rounded-xl border bg-card p-5 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

function StudentHefzView({ schoolId }: { schoolId: number }) {
  const profileQuery = useMyStudentProfile(schoolId);
  const studentId = profileQuery.data?.id ?? 0;
  const progressQuery = useStudentHefzProgress(schoolId, studentId);

  if (profileQuery.isLoading || (studentId > 0 && progressQuery.isLoading)) {
    return <LoadingState message="Loading your Hefz progress..." />;
  }
  if (progressQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(progressQuery.error, "Failed to load Hefz progress")}
        onRetry={() => progressQuery.refetch()}
      />
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Hefz &amp; Najera Progress</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your daily Sobok, Sobok-e-Am, Manzil, and Ustad notes.
        </p>
      </div>
      {!progressQuery.data ? (
        <EmptyState
          icon={BookOpenCheck}
          title="Not enrolled in Hefz/Najera"
          description="You do not have an active Hefz or Najera enrollment yet."
        />
      ) : (
        <pre className="overflow-x-auto rounded-xl border bg-card p-5 text-xs">
          {JSON.stringify(progressQuery.data, null, 2)}
        </pre>
      )}
    </div>
  );
}

function StaffHefzView({ schoolId, canEnroll }: { schoolId: number; canEnroll: boolean }) {
  const [tab, setTab] = useState<"enrollments" | "logs">("enrollments");
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  const enrollmentsQuery = useHefzEnrollments(schoolId);
  const logsQuery = useHefzDailyLogs(schoolId);
  const { data: studentsData } = useStudents(canEnroll ? schoolId : 0, { page: 1, limit: 100 });
  const { data: teachers = [] } = useTeachers(canEnroll ? schoolId : 0);

  const createEnrollMut = useCreateHefzEnrollment(schoolId);
  const upsertLogMut = useUpsertHefzDailyLog(schoolId);

  const [enrollForm, setEnrollForm] = useState({
    studentId: "",
    ustadId: "",
    wing: "HEFZ" as HefzWing,
    currentPara: "1",
    currentSurah: "",
  });

  const [logForm, setLogForm] = useState({
    hefzEnrollmentId: "",
    logDate: new Date().toISOString().slice(0, 10),
    sobok: "",
    sobokPagesOrLines: "",
    sobokQuality: "GOOD" as SobokQuality,
    sobokAm: "",
    manzil: "",
    attendanceStatus: "PRESENT" as HefzAttendanceStatus,
    ustadNote: "",
  });

  if (enrollmentsQuery.isLoading) return <LoadingState message="Loading Hefz & Najera..." />;
  if (enrollmentsQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(enrollmentsQuery.error, "Failed to load Hefz module")}
        onRetry={() => enrollmentsQuery.refetch()}
      />
    );
  }

  const enrollments = enrollmentsQuery.data ?? [];
  const logs = logsQuery.data ?? [];

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    await createEnrollMut.mutateAsync({
      studentId: Number(enrollForm.studentId),
      ustadId: Number(enrollForm.ustadId),
      wing: enrollForm.wing,
      ...(enrollForm.currentPara ? { currentPara: Number(enrollForm.currentPara) } : {}),
      ...(enrollForm.currentSurah ? { currentSurah: enrollForm.currentSurah.trim() } : {}),
    });
    setEnrollOpen(false);
  };

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertLogMut.mutateAsync({
      hefzEnrollmentId: Number(logForm.hefzEnrollmentId),
      logDate: logForm.logDate,
      sobok: logForm.sobok.trim(),
      sobokQuality: logForm.sobokQuality,
      attendanceStatus: logForm.attendanceStatus,
      ...(logForm.sobokPagesOrLines ? { sobokPagesOrLines: logForm.sobokPagesOrLines.trim() } : {}),
      ...(logForm.sobokAm ? { sobokAm: logForm.sobokAm.trim() } : {}),
      ...(logForm.manzil ? { manzil: logForm.manzil.trim() } : {}),
      ...(logForm.ustadNote ? { ustadNote: logForm.ustadNote.trim() } : {}),
    });
    setLogOpen(false);
    setLogForm((prev) => ({ ...prev, sobok: "", sobokAm: "", manzil: "", ustadNote: "" }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hefz &amp; Najera</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage Quran memorization enrollments and daily Sobok / Sobok-e-Am / Manzil logs.
          </p>
        </div>
        <div className="flex gap-2">
          {canEnroll && (
            <Button onClick={() => setEnrollOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Enroll Student
            </Button>
          )}
          <Button variant="outline" onClick={() => setLogOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Record Daily Sobok
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b">
        <button
          type="button"
          onClick={() => setTab("enrollments")}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            tab === "enrollments"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          }`}
        >
          Enrollments ({enrollments.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("logs")}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${
            tab === "logs"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          }`}
        >
          Daily Logs ({logs.length})
        </button>
      </div>

      {tab === "enrollments" ? (
        enrollments.length === 0 ? (
          <EmptyState
            icon={BookOpenCheck}
            title="No Hefz/Najera enrollments"
            description="Enroll students under an Ustad to begin daily Sobok tracking."
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Ustad</th>
                  <th className="px-4 py-3">Wing</th>
                  <th className="px-4 py-3">Current Para / Surah</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {enrollments.map((en) => (
                  <tr key={en.id}>
                    <td className="px-4 py-3 font-medium">
                      {en.student
                        ? `${en.student.firstName} ${en.student.lastName ?? ""}`
                        : `Student #${en.studentId}`}
                    </td>
                    <td className="px-4 py-3">
                      {en.ustad
                        ? `${en.ustad.firstName} ${en.ustad.lastName ?? ""}`
                        : `Ustad #${en.ustadId}`}
                    </td>
                    <td className="px-4 py-3 font-medium">{en.wing}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      Para {en.currentPara ?? "—"} {en.currentSurah ? `• ${en.currentSurah}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
                        {en.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : logs.length === 0 ? (
        <EmptyState
          icon={BookOpenCheck}
          title="No daily logs yet"
          description="Record daily Sobok, Sobok-e-Am, and Manzil evaluations."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Sobok</th>
                <th className="px-4 py-3">Quality</th>
                <th className="px-4 py-3">Manzil</th>
                <th className="px-4 py-3">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 text-xs">
                    {new Date(l.logDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {l.hefzEnrollment?.student
                      ? `${l.hefzEnrollment.student.firstName} ${l.hefzEnrollment.student.lastName ?? ""}`
                      : `Enrollment #${l.hefzEnrollmentId}`}
                  </td>
                  <td className="px-4 py-3">{l.sobok}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
                      {l.sobokQuality}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.manzil ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{l.attendanceStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={enrollOpen} onClose={() => setEnrollOpen(false)} title="Enroll in Hefz / Najera">
        <form onSubmit={handleEnroll} className="space-y-4">
          <div className="space-y-1">
            <Label>Student</Label>
            <select
              required
              value={enrollForm.studentId}
              onChange={(e) => setEnrollForm({ ...enrollForm, studentId: e.target.value })}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Select student...</option>
              {(studentsData?.students ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName ?? ""} ({s.studentId})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Ustad (Teacher)</Label>
            <select
              required
              value={enrollForm.ustadId}
              onChange={(e) => setEnrollForm({ ...enrollForm, ustadId: e.target.value })}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Select Ustad...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName ?? ""} ({t.employeeId})
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Wing</Label>
              <select
                value={enrollForm.wing}
                onChange={(e) => setEnrollForm({ ...enrollForm, wing: e.target.value as HefzWing })}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="HEFZ">HEFZ</option>
                <option value="NAJERA">NAJERA</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Current Para (1–30)</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={enrollForm.currentPara}
                onChange={(e) => setEnrollForm({ ...enrollForm, currentPara: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Current Surah</Label>
              <Input
                placeholder="Al-Baqarah"
                value={enrollForm.currentSurah}
                onChange={(e) => setEnrollForm({ ...enrollForm, currentSurah: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setEnrollOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEnrollMut.isPending}>
              Enroll
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={logOpen} onClose={() => setLogOpen(false)} title="Record Daily Sobok / Manzil Log">
        <form onSubmit={handleLog} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Hefz Enrollment</Label>
              <select
                required
                value={logForm.hefzEnrollmentId}
                onChange={(e) => setLogForm({ ...logForm, hefzEnrollmentId: e.target.value })}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select student...</option>
                {enrollments.map((en) => (
                  <option key={en.id} value={en.id}>
                    {en.student
                      ? `${en.student.firstName} ${en.student.lastName ?? ""} (${en.wing})`
                      : `Enrollment #${en.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Date</Label>
              <Input
                type="date"
                required
                value={logForm.logDate}
                onChange={(e) => setLogForm({ ...logForm, logDate: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Sobok (New Lesson)</Label>
              <Input
                required
                placeholder="Surah Yaseen 1–15"
                value={logForm.sobok}
                onChange={(e) => setLogForm({ ...logForm, sobok: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Sobok Quality</Label>
              <select
                value={logForm.sobokQuality}
                onChange={(e) =>
                  setLogForm({ ...logForm, sobokQuality: e.target.value as SobokQuality })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="GOOD">GOOD</option>
                <option value="AVERAGE">AVERAGE</option>
                <option value="WEAK">WEAK</option>
                <option value="REVISE">REVISE</option>
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Manzil (Revision)</Label>
              <Input
                placeholder="Para 1–3"
                value={logForm.manzil}
                onChange={(e) => setLogForm({ ...logForm, manzil: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Attendance</Label>
              <select
                value={logForm.attendanceStatus}
                onChange={(e) =>
                  setLogForm({
                    ...logForm,
                    attendanceStatus: e.target.value as HefzAttendanceStatus,
                  })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="PRESENT">PRESENT</option>
                <option value="ABSENT">ABSENT</option>
                <option value="LATE">LATE</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setLogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={upsertLogMut.isPending}>
              Save Daily Log
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
