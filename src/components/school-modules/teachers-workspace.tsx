"use client";

import {
  Copy,
  KeyRound,
  LockKeyhole,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClasses, useSections } from "@/features/admin/classes/hooks";
import { useSubjects } from "@/features/subjects/hooks";
import {
  useCreateTeacher,
  useCreateTeacherAssignment,
  useDeactivateTeacher,
  useDeleteTeacherAssignment,
  useResendTeacherOtp,
  useResetTeacherPassword,
  useTeacherAssignments,
  useTeachers,
  useUpdateTeacher,
  useUpdateTeacherAssignment,
  useVerifyTeacherEmail,
} from "@/features/teachers/hooks";
import type {
  TeacherAssignmentRecord,
  TeacherRecord,
} from "@/features/teachers/types";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function TeachersWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";
  const isAdmin = user?.role === "ADMIN";

  const [tab, setTab] = useState<"teachers" | "assignments">("teachers");
  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [verifyTeacherId, setVerifyTeacherId] = useState<number | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [resetTarget, setResetTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState("");
  const [resetMustChange, setResetMustChange] = useState(true);

  const [createdCredentials, setCreatedCredentials] = useState<{
    teacherId: number;
    name: string;
    email: string;
    employeeId: string;
    temporaryPassword: string;
  } | null>(null);

  // Per-teacher 60s resend cooldown tracker (teacherId -> seconds remaining)
  const [cooldowns, setCooldowns] = useState<Record<number, number>>({});

  useEffect(() => {
    const hasActive = Object.values(cooldowns).some((sec) => sec > 0);
    if (!hasActive) return;
    const timer = setInterval(() => {
      setCooldowns((prev) => {
        const next: Record<number, number> = {};
        for (const [key, sec] of Object.entries(prev)) {
          if (sec > 1) next[Number(key)] = sec - 1;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldowns]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    firstName: "",
    lastName: "",
    phone: "",
    designation: "",
    qualification: "",
  });

  const [assignForm, setAssignForm] = useState({
    teacherId: "",
    classId: "",
    sectionId: "",
    subjectId: "",
    academicYear: String(new Date().getFullYear()),
  });

  const [editTeacherTarget, setEditTeacherTarget] =
    useState<TeacherRecord | null>(null);
  const [editTeacherForm, setEditTeacherForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    designation: "",
    department: "",
    qualification: "",
  });

  const [editAssignTarget, setEditAssignTarget] =
    useState<TeacherAssignmentRecord | null>(null);
  const [editAssignForm, setEditAssignForm] = useState({
    classId: "",
    sectionId: "",
    subjectId: "",
    academicYear: "",
    isClassTeacher: false,
  });

  const teachersQuery = useTeachers(schoolId);
  const assignmentsQuery = useTeacherAssignments(schoolId);
  const { data: classes = [] } = useClasses(schoolId);
  const { data: sections = [] } = useSections(schoolId);
  const { data: subjects = [] } = useSubjects(schoolId);

  const createTeacherMut = useCreateTeacher(schoolId);
  const updateTeacherMut = useUpdateTeacher(schoolId);
  const verifyEmailMut = useVerifyTeacherEmail(schoolId);
  const resendOtpMut = useResendTeacherOtp(schoolId);
  const resetPasswordMut = useResetTeacherPassword(schoolId);
  const deactivateMut = useDeactivateTeacher(schoolId);
  const createAssignMut = useCreateTeacherAssignment(schoolId);
  const updateAssignMut = useUpdateTeacherAssignment(schoolId);
  const deleteAssignMut = useDeleteTeacherAssignment(schoolId);

  if (teachersQuery.isLoading)
    return <LoadingState message="Loading teachers..." />;
  if (teachersQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          teachersQuery.error,
          "Failed to load teachers",
        )}
        onRetry={() => teachersQuery.refetch()}
      />
    );
  }

  const teachers = teachersQuery.data ?? [];
  const assignments = assignmentsQuery.data ?? [];

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await createTeacherMut.mutateAsync({
      name: form.name.trim(),
      email: form.email.trim(),
      ...(form.password.trim() ? { password: form.password.trim() } : {}),
      employeeId: form.employeeId.trim(),
      firstName: form.firstName.trim(),
      ...(form.lastName ? { lastName: form.lastName.trim() } : {}),
      ...(form.phone ? { phone: form.phone.trim() } : {}),
      ...(form.designation ? { designation: form.designation.trim() } : {}),
      ...(form.qualification
        ? { qualification: form.qualification.trim() }
        : {}),
    });

    setCreateOpen(false);
    setCooldowns((prev) => ({ ...prev, [created.id]: 60 }));

    if (created.temporaryPassword) {
      setCreatedCredentials({
        teacherId: created.id,
        name: `${created.firstName} ${created.lastName ?? ""}`.trim(),
        email: created.email ?? form.email.trim(),
        employeeId: created.employeeId,
        temporaryPassword: created.temporaryPassword,
      });
    }

    setForm({
      name: "",
      email: "",
      password: "",
      employeeId: "",
      firstName: "",
      lastName: "",
      phone: "",
      designation: "",
      qualification: "",
    });
  };

  const handleResendOtp = async (teacherId: number) => {
    if ((cooldowns[teacherId] ?? 0) > 0) return;
    const res = await resendOtpMut.mutateAsync(teacherId);
    setCooldowns((prev) => ({
      ...prev,
      [teacherId]: res.cooldownSeconds ?? 60,
    }));
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyTeacherId) return;
    await verifyEmailMut.mutateAsync({
      teacherId: verifyTeacherId,
      code: verifyCode.trim(),
    });
    setVerifyTeacherId(null);
    setVerifyCode("");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    await resetPasswordMut.mutateAsync({
      teacherId: resetTarget.id,
      payload: {
        password: resetPasswordVal,
        mustChangePassword: resetMustChange,
      },
    });
    setResetTarget(null);
    setResetPasswordVal("");
    setResetMustChange(true);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAssignMut.mutateAsync({
      teacherId: Number(assignForm.teacherId),
      classId: Number(assignForm.classId),
      sectionId: Number(assignForm.sectionId),
      subjectId: Number(assignForm.subjectId),
      academicYear: assignForm.academicYear.trim(),
    });
    setAssignOpen(false);
  };

  const openEditTeacherModal = (t: TeacherRecord) => {
    setEditTeacherTarget(t);
    setEditTeacherForm({
      firstName: t.firstName,
      lastName: t.lastName ?? "",
      phone: t.phone ?? "",
      designation: t.designation ?? "",
      department:
        "department" in t && typeof t.department === "string"
          ? t.department
          : "",
      qualification: t.qualification ?? "",
    });
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTeacherTarget) return;
    await updateTeacherMut.mutateAsync({
      teacherId: editTeacherTarget.id,
      payload: {
        firstName: editTeacherForm.firstName.trim(),
        ...(editTeacherForm.lastName.trim()
          ? { lastName: editTeacherForm.lastName.trim() }
          : {}),
        ...(editTeacherForm.phone.trim()
          ? { phone: editTeacherForm.phone.trim() }
          : {}),
        ...(editTeacherForm.designation.trim()
          ? { designation: editTeacherForm.designation.trim() }
          : {}),
        ...(editTeacherForm.department.trim()
          ? { department: editTeacherForm.department.trim() }
          : {}),
        ...(editTeacherForm.qualification.trim()
          ? { qualification: editTeacherForm.qualification.trim() }
          : {}),
      },
    });
    setEditTeacherTarget(null);
  };

  const openEditAssignmentModal = (a: TeacherAssignmentRecord) => {
    setEditAssignTarget(a);
    setEditAssignForm({
      classId: String(a.classId),
      sectionId: a.sectionId ? String(a.sectionId) : "",
      subjectId: a.subjectId ? String(a.subjectId) : "",
      academicYear: a.academicYear,
      isClassTeacher:
        "isClassTeacher" in a && typeof a.isClassTeacher === "boolean"
          ? a.isClassTeacher
          : false,
    });
  };

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAssignTarget) return;
    await updateAssignMut.mutateAsync({
      id: editAssignTarget.id,
      payload: {
        classId: Number(editAssignForm.classId),
        sectionId: editAssignForm.sectionId
          ? Number(editAssignForm.sectionId)
          : null,
        subjectId: editAssignForm.subjectId
          ? Number(editAssignForm.subjectId)
          : null,
        academicYear: editAssignForm.academicYear.trim(),
        isClassTeacher: editAssignForm.isClassTeacher,
      },
    });
    setEditAssignTarget(null);
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Teachers &amp; Assignments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage faculty accounts, email OTP verification, password resets,
            and class/subject assignments.
          </p>
        </div>

        {canManage && (
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button
              onClick={() => setCreateOpen(true)}
              className="min-h-[44px] gap-1.5 rounded-[11px] sm:min-h-0"
            >
              <Plus className="h-4 w-4" />
              Add Teacher
            </Button>
            <Button
              variant="outline"
              onClick={() => setAssignOpen(true)}
              className="min-h-[44px] gap-1.5 rounded-[11px] sm:min-h-0"
            >
              <Plus className="h-4 w-4" />
              Assign Subject
            </Button>
          </div>
        )}
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto border-b">
        <button
          type="button"
          onClick={() => setTab("teachers")}
          className={`min-h-[44px] shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition ${
            tab === "teachers"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Teachers ({teachers.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("assignments")}
          className={`min-h-[44px] shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition ${
            tab === "assignments"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Class Assignments ({assignments.length})
        </button>
      </div>

      {tab === "teachers" ? (
        teachers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No teachers added yet"
            description="Create a teacher account and verify their email OTP to activate login."
          />
        ) : (
          <>
            {/* Mobile Teacher Cards */}
            <div className="space-y-2.5 md:hidden">
              {teachers.map((t) => {
                const status =
                  t.user?.status ??
                  t.status ??
                  (t.isActive ? "ACTIVE" : "INACTIVE");
                const cd = cooldowns[t.id] ?? 0;
                const fullName = `${t.firstName} ${t.lastName ?? ""}`.trim();

                return (
                  <div key={t.id} className="mobile-card space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {fullName}
                        </p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {t.employeeId} • {t.designation ?? "Teacher"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                        {status}
                      </span>
                    </div>

                    <p className="truncate text-xs text-muted-foreground">
                      {t.user?.email ?? t.email ?? "—"}
                      {t.phone ? ` • ${t.phone}` : ""}
                    </p>

                    {canManage && (
                      <div className="flex flex-wrap gap-2 border-t pt-2.5">
                        {status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setVerifyTeacherId(t.id)}
                              className="min-h-[40px] flex-1 gap-1 rounded-[11px] text-xs"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                              Verify OTP
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={cd > 0 || resendOtpMut.isPending}
                              onClick={() => handleResendOtp(t.id)}
                              className="min-h-[40px] flex-1 gap-1 rounded-[11px] text-xs"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              {cd > 0 ? `Resend (${cd}s)` : "Resend OTP"}
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditTeacherModal(t)}
                          className="min-h-[40px] flex-1 gap-1 rounded-[11px] text-xs"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setResetTarget({ id: t.id, name: fullName })
                          }
                          className="min-h-[40px] flex-1 gap-1 rounded-[11px] text-xs"
                        >
                          <LockKeyhole className="h-3.5 w-3.5" />
                          Reset Password
                        </Button>
                        {isAdmin && t.isActive && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deactivateMut.mutate(t.id)}
                            className="min-h-[40px] rounded-[11px] text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Teacher Table */}
            <div className="surface-panel hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Employee ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email &amp; Phone</th>
                    <th className="px-4 py-3">Designation</th>
                    <th className="px-4 py-3">Account Status</th>
                    {canManage && (
                      <th className="px-4 py-3 text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {teachers.map((t) => {
                    const status =
                      t.user?.status ??
                      t.status ??
                      (t.isActive ? "ACTIVE" : "INACTIVE");
                    const cd = cooldowns[t.id] ?? 0;
                    const fullName =
                      `${t.firstName} ${t.lastName ?? ""}`.trim();

                    return (
                      <tr key={t.id}>
                        <td className="px-4 py-3 font-mono text-xs">
                          {t.employeeId}
                        </td>
                        <td className="px-4 py-3 font-medium">{fullName}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          <p>{t.user?.email ?? t.email ?? "—"}</p>
                          {t.phone && <p>{t.phone}</p>}
                        </td>
                        <td className="px-4 py-3">{t.designation ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
                            {status}
                          </span>
                        </td>
                        {canManage && (
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                              {status === "PENDING" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setVerifyTeacherId(t.id)}
                                    className="gap-1"
                                  >
                                    <KeyRound className="h-3.5 w-3.5" />
                                    Verify OTP
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={cd > 0 || resendOtpMut.isPending}
                                    onClick={() => handleResendOtp(t.id)}
                                    className="gap-1"
                                  >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    {cd > 0 ? `${cd}s` : "Resend OTP"}
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditTeacherModal(t)}
                                className="gap-1"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setResetTarget({ id: t.id, name: fullName })
                                }
                                className="gap-1"
                              >
                                <LockKeyhole className="h-3.5 w-3.5" />
                                Reset Password
                              </Button>
                              {isAdmin && t.isActive && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deactivateMut.mutate(t.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teacher assignments"
          description="Assign teachers to classes, sections, and subjects."
        />
      ) : (
        <div className="surface-panel overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Teacher</th>
                <th className="px-4 py-3">Class &amp; Section</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Year</th>
                {canManage && <th className="px-4 py-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-medium">
                    {a.teacher
                      ? `${a.teacher.firstName} ${a.teacher.lastName ?? ""}`
                      : `Teacher #${a.teacherId}`}
                  </td>
                  <td className="px-4 py-3">
                    {a.class?.name ?? a.classId} —{" "}
                    {a.section?.name ?? a.sectionId}
                  </td>
                  <td className="px-4 py-3">
                    {a.subject?.name ?? a.subjectId}
                  </td>
                  <td className="px-4 py-3">{a.academicYear}</td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditAssignmentModal(a)}
                          className="gap-1"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAssignMut.mutate(a.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Teacher Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add New Teacher"
      >
        <form onSubmit={handleCreateTeacher} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Full Account Name *</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Employee ID *</Label>
              <Input
                required
                placeholder="TCH-001"
                value={form.employeeId}
                onChange={(e) =>
                  setForm({ ...form, employeeId: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>First Name *</Label>
              <Input
                required
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Last Name</Label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Email *</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Password (Optional — min 8 chars)</Label>
              <Input
                type="password"
                minLength={8}
                placeholder="Leave blank to auto-generate"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Designation</Label>
              <Input
                placeholder="Senior Ustad"
                value={form.designation}
                onChange={(e) =>
                  setForm({ ...form, designation: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input
                placeholder="01XXXXXXXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createTeacherMut.isPending}>
              {createTeacherMut.isPending ? "Creating..." : "Create Teacher"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* One-Time Temporary Credentials Confirmation Modal */}
      <Modal
        open={!!createdCredentials}
        onClose={() => setCreatedCredentials(null)}
        title="Teacher Created — Save Temporary Password"
        maxWidthClass="max-w-md"
      >
        {createdCredentials && (
          <div className="space-y-4 text-sm">
            <p className="text-xs text-muted-foreground">
              Share these credentials securely with{" "}
              <strong className="text-foreground">
                {createdCredentials.name}
              </strong>
              . This temporary password is shown only once. A 6-digit email
              verification OTP has also been sent.
            </p>

            <div className="space-y-2.5 rounded-[11px] border bg-muted/30 p-3.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{createdCredentials.email}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Employee ID</span>
                <span className="font-mono font-semibold">
                  {createdCredentials.employeeId}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 border-t pt-2">
                <span className="text-muted-foreground">Temp Password</span>
                <div className="flex items-center gap-1.5">
                  <code className="rounded bg-background px-2 py-0.5 font-mono text-sm font-bold text-primary">
                    {createdCredentials.temporaryPassword}
                  </code>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyText(
                        createdCredentials.temporaryPassword,
                        "Temporary password",
                      )
                    }
                    className="h-7 px-2"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreatedCredentials(null)}
              >
                Done
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const id = createdCredentials.teacherId;
                  setCreatedCredentials(null);
                  setVerifyTeacherId(id);
                }}
              >
                Enter Email OTP Now
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Subject Modal */}
      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title="Assign Teacher to Class & Subject"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div className="space-y-1">
            <Label>Teacher</Label>
            <select
              required
              value={assignForm.teacherId}
              onChange={(e) =>
                setAssignForm({ ...assignForm, teacherId: e.target.value })
              }
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Select teacher...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName ?? ""} ({t.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Class</Label>
              <select
                required
                value={assignForm.classId}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, classId: e.target.value })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
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
              <Label>Section</Label>
              <select
                required
                value={assignForm.sectionId}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, sectionId: e.target.value })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select section...</option>
                {sections
                  .filter(
                    (s) =>
                      !assignForm.classId ||
                      s.classId === Number(assignForm.classId),
                  )
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Subject</Label>
              <select
                required
                value={assignForm.subjectId}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, subjectId: e.target.value })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select subject...</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Academic Year</Label>
              <Input
                required
                value={assignForm.academicYear}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, academicYear: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAssignOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createAssignMut.isPending}>
              {createAssignMut.isPending ? "Assigning..." : "Save Assignment"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Verify Teacher Email OTP Modal (with Resend OTP + 60s Cooldown) */}
      <Modal
        open={!!verifyTeacherId}
        onClose={() => setVerifyTeacherId(null)}
        title="Verify Teacher Email OTP"
        maxWidthClass="max-w-sm"
      >
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1.5">
            <Label>6-Digit Verification Code</Label>
            <Input
              required
              maxLength={6}
              inputMode="numeric"
              placeholder="123456"
              value={verifyCode}
              onChange={(e) =>
                setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="text-center font-mono text-lg tracking-[0.35em]"
            />
          </div>

          {verifyTeacherId && (
            <div className="flex items-center justify-between rounded-[11px] bg-muted/40 px-3 py-2 text-xs">
              <span className="text-muted-foreground">
                Code expired or missing?
              </span>
              <button
                type="button"
                disabled={
                  (cooldowns[verifyTeacherId] ?? 0) > 0 ||
                  resendOtpMut.isPending
                }
                onClick={() => handleResendOtp(verifyTeacherId)}
                className="font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {(cooldowns[verifyTeacherId] ?? 0) > 0
                  ? `Resend in ${cooldowns[verifyTeacherId]}s`
                  : "Resend OTP"}
              </button>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setVerifyTeacherId(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={verifyEmailMut.isPending || verifyCode.length !== 6}
            >
              {verifyEmailMut.isPending ? "Verifying..." : "Verify & Activate"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Teacher Password Modal */}
      <Modal
        open={!!resetTarget}
        onClose={() => {
          setResetTarget(null);
          setResetPasswordVal("");
        }}
        title={
          resetTarget
            ? `Reset Password — ${resetTarget.name}`
            : "Reset Teacher Password"
        }
        maxWidthClass="max-w-sm"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1.5">
            <Label>New Password (min 8 chars) *</Label>
            <Input
              type="password"
              required
              minLength={8}
              value={resetPasswordVal}
              onChange={(e) => setResetPasswordVal(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={resetMustChange}
              onChange={(e) => setResetMustChange(e.target.checked)}
              className="h-4 w-4 rounded border"
            />
            Require teacher to change password on next login
          </label>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setResetTarget(null);
                setResetPasswordVal("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={resetPasswordMut.isPending}>
              {resetPasswordMut.isPending ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal
        open={!!editTeacherTarget}
        onClose={() => setEditTeacherTarget(null)}
        title="Edit Teacher"
      >
        <form onSubmit={handleUpdateTeacher} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>First Name *</Label>
              <Input
                required
                value={editTeacherForm.firstName}
                onChange={(e) =>
                  setEditTeacherForm({
                    ...editTeacherForm,
                    firstName: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Last Name</Label>
              <Input
                value={editTeacherForm.lastName}
                onChange={(e) =>
                  setEditTeacherForm({
                    ...editTeacherForm,
                    lastName: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input
                value={editTeacherForm.phone}
                onChange={(e) =>
                  setEditTeacherForm({
                    ...editTeacherForm,
                    phone: e.target.value,
                  })
                }
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div className="space-y-1">
              <Label>Designation</Label>
              <Input
                value={editTeacherForm.designation}
                onChange={(e) =>
                  setEditTeacherForm({
                    ...editTeacherForm,
                    designation: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Department</Label>
              <Input
                value={editTeacherForm.department}
                onChange={(e) =>
                  setEditTeacherForm({
                    ...editTeacherForm,
                    department: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Qualification</Label>
              <Input
                value={editTeacherForm.qualification}
                onChange={(e) =>
                  setEditTeacherForm({
                    ...editTeacherForm,
                    qualification: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditTeacherTarget(null)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateTeacherMut.isPending}>
              {updateTeacherMut.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Teacher Assignment Modal */}
      <Modal
        open={!!editAssignTarget}
        onClose={() => setEditAssignTarget(null)}
        title="Edit Teacher Assignment"
      >
        <form onSubmit={handleUpdateAssignment} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Class *</Label>
              <select
                required
                value={editAssignForm.classId}
                onChange={(e) =>
                  setEditAssignForm({
                    ...editAssignForm,
                    classId: e.target.value,
                    sectionId: "",
                  })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
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
              <Label>Section</Label>
              <select
                value={editAssignForm.sectionId}
                onChange={(e) =>
                  setEditAssignForm({
                    ...editAssignForm,
                    sectionId: e.target.value,
                  })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">None</option>
                {sections
                  .filter(
                    (s) =>
                      !editAssignForm.classId ||
                      s.classId === Number(editAssignForm.classId),
                  )
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Subject</Label>
              <select
                value={editAssignForm.subjectId}
                onChange={(e) =>
                  setEditAssignForm({
                    ...editAssignForm,
                    subjectId: e.target.value,
                  })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">None</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Academic Year *</Label>
              <Input
                required
                value={editAssignForm.academicYear}
                onChange={(e) =>
                  setEditAssignForm({
                    ...editAssignForm,
                    academicYear: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={editAssignForm.isClassTeacher}
              onChange={(e) =>
                setEditAssignForm({
                  ...editAssignForm,
                  isClassTeacher: e.target.checked,
                })
              }
              className="h-4 w-4 rounded border"
            />
            Assign as Class Teacher
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditAssignTarget(null)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateAssignMut.isPending}>
              {updateAssignMut.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
