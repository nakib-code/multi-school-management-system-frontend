"use client";

import { BookOpenCheck, Pencil, Plus } from "lucide-react";
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
  useUpdateHefzDailyLog,
  useUpdateHefzEnrollment,
  useUpsertHefzDailyLog,
} from "@/features/hefz/hooks";
import type {
  HefzAttendanceStatus,
  HefzDailyLogRecord,
  HefzEnrollmentRecord,
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

  return (
    <StaffHefzView
      schoolId={schoolId}
      canEnroll={role === "ADMIN" || role === "MANAGER"}
    />
  );
}

interface HefzProgressReport {
  student: {
    id: number;
    studentId: string;
    firstName: string;
    lastName: string | null;
  };
  enrollments: Array<{
    id: number;
    wing: HefzWing;
    currentPara: number | null;
    currentSurah: string | null;
    status: string;
    ustad?: { firstName: string; lastName: string | null; employeeId: string };
  }>;
  summary: {
    totalLogs: number;
    attendance: { present: number; absent: number; late: number };
    sobokQuality: {
      good: number;
      average: number;
      weak: number;
      revise: number;
    };
  };
  recentLogs: Array<{
    id: number;
    logDate: string;
    sobok: string;
    sobokQuality: SobokQuality;
    manzil: string | null;
    attendanceStatus: HefzAttendanceStatus;
    ustadNote: string | null;
  }>;
}

function HefzProgressCard({ report }: { report: HefzProgressReport }) {
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">
            {report.student.firstName} {report.student.lastName ?? ""}
          </h2>
          <p className="font-mono text-xs text-muted-foreground">
            {report.student.studentId}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-700">
            Present: {report.summary.attendance.present}
          </span>
          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 font-medium text-amber-700">
            Late: {report.summary.attendance.late}
          </span>
          <span className="rounded-full bg-red-500/10 px-2.5 py-1 font-medium text-red-700">
            Absent: {report.summary.attendance.absent}
          </span>
        </div>
      </div>

      {report.enrollments.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {report.enrollments.map((en) => (
            <div
              key={en.id}
              className="rounded-xl border bg-muted/20 p-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{en.wing} Wing</span>
                <span className="rounded border px-1.5 py-0.5">
                  {en.status}
                </span>
              </div>
              <p className="mt-1 text-muted-foreground">
                Para {en.currentPara ?? "—"}
                {en.currentSurah ? ` • ${en.currentSurah}` : ""}
              </p>
              {en.ustad && (
                <p className="mt-0.5 text-muted-foreground">
                  Ustad: {en.ustad.firstName} {en.ustad.lastName ?? ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {report.recentLogs.length > 0 ? (
        <>
          <div className="space-y-2 md:hidden">
            {report.recentLogs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="rounded-[11px] border bg-muted/20 p-3 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">
                    {new Date(log.logDate).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1.5">
                    <span className="rounded-full border bg-background px-2 py-0.5 text-[10px] font-semibold">
                      {log.sobokQuality}
                    </span>
                    <span className="rounded-full border bg-background px-2 py-0.5 text-[10px]">
                      {log.attendanceStatus}
                    </span>
                  </div>
                </div>
                <p className="mt-1.5 font-medium">Sobok: {log.sobok}</p>
                {log.manzil && (
                  <p className="mt-0.5 text-muted-foreground">
                    Manzil: {log.manzil}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-[11px] border md:block">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Sobok</th>
                  <th className="px-3 py-2">Quality</th>
                  <th className="px-3 py-2">Manzil</th>
                  <th className="px-3 py-2">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {report.recentLogs.slice(0, 10).map((log) => (
                  <tr key={log.id}>
                    <td className="px-3 py-2">
                      {new Date(log.logDate).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 font-medium">{log.sobok}</td>
                    <td className="px-3 py-2">{log.sobokQuality}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {log.manzil ?? "—"}
                    </td>
                    <td className="px-3 py-2">{log.attendanceStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">
          No daily Sobok logs recorded yet.
        </p>
      )}
    </div>
  );
}

function GuardianHefzView({ schoolId }: { schoolId: number }) {
  const { data, isLoading, isError, error, refetch } =
    useGuardianHefzProgress(schoolId);
  if (isLoading)
    return <LoadingState message="Loading children's Hefz progress..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load Hefz progress")}
        onRetry={() => refetch()}
      />
    );
  }
  const reports = (Array.isArray(data) ? data : []) as HefzProgressReport[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Hefz &amp; Najera Progress
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Daily Sobok, Sobok-e-Am, and Manzil memorization updates for your
          linked children.
        </p>
      </div>
      {reports.length === 0 ? (
        <EmptyState
          icon={BookOpenCheck}
          title="No Hefz progress records yet"
          description="Once your child is enrolled in the Noorani, Najera, or Hefz wing, daily logs will appear here."
        />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <HefzProgressCard key={report.student.id} report={report} />
          ))}
        </div>
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
        message={getApiErrorMessage(
          progressQuery.error,
          "Failed to load Hefz progress",
        )}
        onRetry={() => progressQuery.refetch()}
      />
    );
  }
  const report = progressQuery.data as HefzProgressReport | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          My Hefz &amp; Najera Progress
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your daily Sobok, Sobok-e-Am, Manzil, and Ustad notes.
        </p>
      </div>
      {!report ? (
        <EmptyState
          icon={BookOpenCheck}
          title="Not enrolled in Hefz/Najera"
          description="You do not have an active Hefz or Najera enrollment yet."
        />
      ) : (
        <HefzProgressCard report={report} />
      )}
    </div>
  );
}

function StaffHefzView({
  schoolId,
  canEnroll,
}: {
  schoolId: number;
  canEnroll: boolean;
}) {
  const [tab, setTab] = useState<"enrollments" | "logs">("enrollments");
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [editEnroll, setEditEnroll] = useState<HefzEnrollmentRecord | null>(
    null,
  );
  const [editLog, setEditLog] = useState<HefzDailyLogRecord | null>(null);

  const enrollmentsQuery = useHefzEnrollments(schoolId);
  const logsQuery = useHefzDailyLogs(schoolId);
  const { data: studentsData } = useStudents(canEnroll ? schoolId : 0, {
    page: 1,
    limit: 100,
  });
  const { data: teachers = [] } = useTeachers(canEnroll ? schoolId : 0);

  const createEnrollMut = useCreateHefzEnrollment(schoolId);
  const updateEnrollMut = useUpdateHefzEnrollment(schoolId);
  const upsertLogMut = useUpsertHefzDailyLog(schoolId);
  const updateLogMut = useUpdateHefzDailyLog(schoolId);

  const [enrollForm, setEnrollForm] = useState({
    studentId: "",
    ustadId: "",
    wing: "HEFZ" as HefzWing,
    currentPara: "1",
    currentSurah: "",
  });

  const [editEnrollForm, setEditEnrollForm] = useState({
    wing: "HEFZ" as HefzWing,
    currentPara: "",
    currentSurah: "",
    status: "ACTIVE",
    ustadId: "",
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

  const [editLogForm, setEditLogForm] = useState({
    sabak: "",
    satsabak: "",
    amukhta: "",
    remarks: "",
  });

  if (enrollmentsQuery.isLoading)
    return <LoadingState message="Loading Hefz & Najera..." />;
  if (enrollmentsQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          enrollmentsQuery.error,
          "Failed to load Hefz module",
        )}
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
      ...(enrollForm.currentPara
        ? { currentPara: Number(enrollForm.currentPara) }
        : {}),
      ...(enrollForm.currentSurah
        ? { currentSurah: enrollForm.currentSurah.trim() }
        : {}),
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
      ...(logForm.sobokPagesOrLines
        ? { sobokPagesOrLines: logForm.sobokPagesOrLines.trim() }
        : {}),
      ...(logForm.sobokAm ? { sobokAm: logForm.sobokAm.trim() } : {}),
      ...(logForm.manzil ? { manzil: logForm.manzil.trim() } : {}),
      ...(logForm.ustadNote ? { ustadNote: logForm.ustadNote.trim() } : {}),
    });
    setLogOpen(false);
    setLogForm((prev) => ({
      ...prev,
      sobok: "",
      sobokAm: "",
      manzil: "",
      ustadNote: "",
    }));
  };

  const openEditEnroll = (en: HefzEnrollmentRecord) => {
    setEditEnroll(en);
    setEditEnrollForm({
      wing: en.wing,
      currentPara: en.currentPara != null ? String(en.currentPara) : "",
      currentSurah: en.currentSurah ?? "",
      status: en.status,
      ustadId: String(en.ustadId),
    });
  };

  const handleUpdateEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEnroll) return;
    await updateEnrollMut.mutateAsync({
      id: editEnroll.id,
      payload: {
        wing: editEnrollForm.wing,
        ...(editEnrollForm.currentPara !== ""
          ? { currentPara: Number(editEnrollForm.currentPara) }
          : {}),
        ...(editEnrollForm.currentSurah.trim()
          ? { currentSurah: editEnrollForm.currentSurah.trim() }
          : {}),
        status: editEnrollForm.status,
        ustadId: editEnrollForm.ustadId ? Number(editEnrollForm.ustadId) : null,
      },
    });
    setEditEnroll(null);
  };

  const openEditLog = (l: HefzDailyLogRecord) => {
    setEditLog(l);
    setEditLogForm({
      sabak: l.sobok ?? "",
      satsabak: l.sobokAm ?? "",
      amukhta: l.manzil ?? "",
      remarks: l.ustadNote ?? "",
    });
  };

  const handleUpdateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLog) return;
    await updateLogMut.mutateAsync({
      id: editLog.id,
      payload: {
        ...(editLogForm.sabak.trim()
          ? { sabak: editLogForm.sabak.trim() }
          : {}),
        ...(editLogForm.satsabak.trim()
          ? { satsabak: editLogForm.satsabak.trim() }
          : {}),
        ...(editLogForm.amukhta.trim()
          ? { amukhta: editLogForm.amukhta.trim() }
          : {}),
        ...(editLogForm.remarks.trim()
          ? { remarks: editLogForm.remarks.trim() }
          : {}),
      },
    });
    setEditLog(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hefz &amp; Najera
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage Quran memorization enrollments and daily Sobok / Sobok-e-Am /
            Manzil logs.
          </p>
        </div>
        <div className="flex gap-2">
          {canEnroll && (
            <Button onClick={() => setEnrollOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Enroll Student
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setLogOpen(true)}
            className="gap-1.5"
          >
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
          <>
            <div className="space-y-2.5 md:hidden">
              {enrollments.map((en) => (
                <div key={en.id} className="mobile-card space-y-1.5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">
                      {en.student
                        ? `${en.student.firstName} ${en.student.lastName ?? ""}`
                        : `Student #${en.studentId}`}
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                        {en.wing} • {en.status}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditEnroll(en)}
                        className="h-7 w-7 p-0"
                        title="Edit enrollment"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    Ustad:{" "}
                    {en.ustad
                      ? `${en.ustad.firstName} ${en.ustad.lastName ?? ""}`
                      : `#${en.ustadId}`}
                  </p>
                  <p className="text-muted-foreground">
                    Para {en.currentPara ?? "—"}{" "}
                    {en.currentSurah ? `• ${en.currentSurah}` : ""}
                  </p>
                </div>
              ))}
            </div>

            <div className="surface-panel hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Ustad</th>
                    <th className="px-4 py-3">Wing</th>
                    <th className="px-4 py-3">Current Para / Surah</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
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
                        Para {en.currentPara ?? "—"}{" "}
                        {en.currentSurah ? `• ${en.currentSurah}` : ""}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
                          {en.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditEnroll(en)}
                          title="Edit enrollment"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      ) : logs.length === 0 ? (
        <EmptyState
          icon={BookOpenCheck}
          title="No daily logs yet"
          description="Record daily Sobok, Sobok-e-Am, and Manzil evaluations."
        />
      ) : (
        <>
          <div className="space-y-2.5 md:hidden">
            {logs.map((l) => (
              <div key={l.id} className="mobile-card space-y-1.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {l.hefzEnrollment?.student
                        ? `${l.hefzEnrollment.student.firstName} ${l.hefzEnrollment.student.lastName ?? ""}`
                        : `Enrollment #${l.hefzEnrollmentId}`}
                    </p>
                    <p className="text-muted-foreground">
                      {new Date(l.logDate).toLocaleDateString()} •{" "}
                      {l.attendanceStatus}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                      {l.sobokQuality}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditLog(l)}
                      className="h-7 w-7 p-0"
                      title="Edit daily log"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="font-medium">Sobok: {l.sobok}</p>
                {l.manzil && (
                  <p className="text-muted-foreground">Manzil: {l.manzil}</p>
                )}
              </div>
            ))}
          </div>

          <div className="surface-panel hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Sobok</th>
                  <th className="px-4 py-3">Quality</th>
                  <th className="px-4 py-3">Manzil</th>
                  <th className="px-4 py-3">Attendance</th>
                  <th className="px-4 py-3 text-right">Action</th>
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
                    <td className="px-4 py-3 text-muted-foreground">
                      {l.manzil ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">{l.attendanceStatus}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditLog(l)}
                        title="Edit daily log"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal
        open={enrollOpen}
        onClose={() => setEnrollOpen(false)}
        title="Enroll in Hefz / Najera"
      >
        <form onSubmit={handleEnroll} className="space-y-4">
          <div className="space-y-1">
            <Label>Student</Label>
            <select
              required
              value={enrollForm.studentId}
              onChange={(e) =>
                setEnrollForm({ ...enrollForm, studentId: e.target.value })
              }
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
              onChange={(e) =>
                setEnrollForm({ ...enrollForm, ustadId: e.target.value })
              }
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
                onChange={(e) =>
                  setEnrollForm({
                    ...enrollForm,
                    wing: e.target.value as HefzWing,
                  })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="NOORANI">NOORANI</option>
                <option value="QAIDA">QAIDA</option>
                <option value="AMPARA">AMPARA</option>
                <option value="NAJERA">NAJERA</option>
                <option value="HEFZ">HEFZ</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Current Para (1–30)</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={enrollForm.currentPara}
                onChange={(e) =>
                  setEnrollForm({ ...enrollForm, currentPara: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Current Surah</Label>
              <Input
                placeholder="Al-Baqarah"
                value={enrollForm.currentSurah}
                onChange={(e) =>
                  setEnrollForm({ ...enrollForm, currentSurah: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEnrollOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createEnrollMut.isPending}>
              Enroll
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        title="Record Daily Sobok / Manzil Log"
      >
        <form onSubmit={handleLog} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Hefz Enrollment</Label>
              <select
                required
                value={logForm.hefzEnrollmentId}
                onChange={(e) =>
                  setLogForm({ ...logForm, hefzEnrollmentId: e.target.value })
                }
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
                onChange={(e) =>
                  setLogForm({ ...logForm, logDate: e.target.value })
                }
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
                onChange={(e) =>
                  setLogForm({ ...logForm, sobok: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Sobok Quality</Label>
              <select
                value={logForm.sobokQuality}
                onChange={(e) =>
                  setLogForm({
                    ...logForm,
                    sobokQuality: e.target.value as SobokQuality,
                  })
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
                onChange={(e) =>
                  setLogForm({ ...logForm, manzil: e.target.value })
                }
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setLogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={upsertLogMut.isPending}>
              Save Daily Log
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!editEnroll}
        onClose={() => setEditEnroll(null)}
        title="Edit Hefz Enrollment"
      >
        <form onSubmit={handleUpdateEnroll} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Wing</Label>
              <select
                value={editEnrollForm.wing}
                onChange={(e) =>
                  setEditEnrollForm({
                    ...editEnrollForm,
                    wing: e.target.value as HefzWing,
                  })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="NOORANI">NOORANI</option>
                <option value="QAIDA">QAIDA</option>
                <option value="AMPARA">AMPARA</option>
                <option value="NAJERA">NAJERA</option>
                <option value="HEFZ">HEFZ</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <select
                value={editEnrollForm.status}
                onChange={(e) =>
                  setEditEnrollForm({
                    ...editEnrollForm,
                    status: e.target.value,
                  })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="PAUSED">PAUSED</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Current Para (1–30)</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={editEnrollForm.currentPara}
                onChange={(e) =>
                  setEditEnrollForm({
                    ...editEnrollForm,
                    currentPara: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Current Surah</Label>
              <Input
                placeholder="Al-Baqarah"
                value={editEnrollForm.currentSurah}
                onChange={(e) =>
                  setEditEnrollForm({
                    ...editEnrollForm,
                    currentSurah: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Ustad (Teacher)</Label>
            <select
              value={editEnrollForm.ustadId}
              onChange={(e) =>
                setEditEnrollForm({
                  ...editEnrollForm,
                  ustadId: e.target.value,
                })
              }
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Unassigned</option>
              {teachers.length > 0
                ? teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName ?? ""} ({t.employeeId})
                    </option>
                  ))
                : editEnroll?.ustad && (
                    <option value={editEnroll.ustadId}>
                      {editEnroll.ustad.firstName}{" "}
                      {editEnroll.ustad.lastName ?? ""} (
                      {editEnroll.ustad.employeeId})
                    </option>
                  )}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditEnroll(null)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateEnrollMut.isPending}>
              {updateEnrollMut.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!editLog}
        onClose={() => setEditLog(null)}
        title="Edit Daily Log"
      >
        <form onSubmit={handleUpdateLog} className="space-y-4">
          <div className="space-y-1">
            <Label>Sabak (New Lesson)</Label>
            <Input
              placeholder="Surah Yaseen 1–15"
              value={editLogForm.sabak}
              onChange={(e) =>
                setEditLogForm({ ...editLogForm, sabak: e.target.value })
              }
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Satsabak (Recent Revision)</Label>
              <Input
                placeholder="Last 7 days"
                value={editLogForm.satsabak}
                onChange={(e) =>
                  setEditLogForm({ ...editLogForm, satsabak: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Amukhta (Manzil / Old Revision)</Label>
              <Input
                placeholder="Para 1–3"
                value={editLogForm.amukhta}
                onChange={(e) =>
                  setEditLogForm({ ...editLogForm, amukhta: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Remarks</Label>
            <Input
              placeholder="Ustad remarks..."
              value={editLogForm.remarks}
              onChange={(e) =>
                setEditLogForm({ ...editLogForm, remarks: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditLog(null)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateLogMut.isPending}>
              {updateLogMut.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
