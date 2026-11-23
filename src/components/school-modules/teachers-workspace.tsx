"use client";

import { KeyRound, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
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
  useTeacherAssignments,
  useTeachers,
  useVerifyTeacherEmail,
} from "@/features/teachers/hooks";
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

  const teachersQuery = useTeachers(schoolId);
  const assignmentsQuery = useTeacherAssignments(schoolId);
  const { data: classes = [] } = useClasses(schoolId);
  const { data: sections = [] } = useSections(schoolId);
  const { data: subjects = [] } = useSubjects(schoolId);

  const createTeacherMut = useCreateTeacher(schoolId);
  const verifyEmailMut = useVerifyTeacherEmail(schoolId);
  const deactivateMut = useDeactivateTeacher(schoolId);
  const createAssignMut = useCreateTeacherAssignment(schoolId);
  const deleteAssignMut = useDeleteTeacherAssignment(schoolId);

  if (teachersQuery.isLoading) return <LoadingState message="Loading teachers..." />;
  if (teachersQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(teachersQuery.error, "Failed to load teachers")}
        onRetry={() => teachersQuery.refetch()}
      />
    );
  }

  const teachers = teachersQuery.data ?? [];
  const assignments = assignmentsQuery.data ?? [];

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTeacherMut.mutateAsync({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      employeeId: form.employeeId.trim(),
      firstName: form.firstName.trim(),
      ...(form.lastName ? { lastName: form.lastName.trim() } : {}),
      ...(form.phone ? { phone: form.phone.trim() } : {}),
      ...(form.designation ? { designation: form.designation.trim() } : {}),
      ...(form.qualification ? { qualification: form.qualification.trim() } : {}),
    });
    setCreateOpen(false);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Teachers &amp; Assignments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage faculty accounts, email verification, and class/subject teaching assignments.
          </p>
        </div>

        {canManage && (
          <div className="flex gap-2">
            <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Teacher
            </Button>
            <Button variant="outline" onClick={() => setAssignOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Assign Subject
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-2 border-b">
        <button
          type="button"
          onClick={() => setTab("teachers")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
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
          className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
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
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Employee ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Account Status</th>
                  {canManage && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y">
                {teachers.map((t) => {
                  const status = t.user?.status ?? t.status ?? (t.isActive ? "ACTIVE" : "INACTIVE");
                  return (
                    <tr key={t.id}>
                      <td className="px-4 py-3 font-mono text-xs">{t.employeeId}</td>
                      <td className="px-4 py-3 font-medium">
                        {t.firstName} {t.lastName ?? ""}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {t.user?.email ?? t.email ?? "—"}
                      </td>
                      <td className="px-4 py-3">{t.designation ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
                          {status}
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            {status === "PENDING" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setVerifyTeacherId(t.id)}
                                className="gap-1"
                              >
                                <KeyRound className="h-3.5 w-3.5" />
                                Verify OTP
                              </Button>
                            )}
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
        )
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teacher assignments"
          description="Assign teachers to classes, sections, and subjects."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
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
                    {a.class?.name ?? a.classId} — {a.section?.name ?? a.sectionId}
                  </td>
                  <td className="px-4 py-3">{a.subject?.name ?? a.subjectId}</td>
                  <td className="px-4 py-3">{a.academicYear}</td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteAssignMut.mutate(a.id)}
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

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Teacher">
        <form onSubmit={handleCreateTeacher} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Full Account Name</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Employee ID</Label>
              <Input
                required
                placeholder="TCH-001"
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>First Name</Label>
              <Input
                required
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
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
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Password (min 8 chars)</Label>
              <Input
                type="password"
                minLength={8}
                required
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
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTeacherMut.isPending}>
              {createTeacherMut.isPending ? "Creating..." : "Create Teacher"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Teacher to Class & Subject">
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div className="space-y-1">
            <Label>Teacher</Label>
            <select
              required
              value={assignForm.teacherId}
              onChange={(e) => setAssignForm({ ...assignForm, teacherId: e.target.value })}
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
                onChange={(e) => setAssignForm({ ...assignForm, classId: e.target.value })}
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
                onChange={(e) => setAssignForm({ ...assignForm, sectionId: e.target.value })}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select section...</option>
                {sections
                  .filter((s) => !assignForm.classId || s.classId === Number(assignForm.classId))
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
                onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })}
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
                onChange={(e) => setAssignForm({ ...assignForm, academicYear: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAssignMut.isPending}>
              {createAssignMut.isPending ? "Assigning..." : "Save Assignment"}
            </Button>
          </div>
        </form>
      </Modal>

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
              placeholder="123456"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setVerifyTeacherId(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={verifyEmailMut.isPending}>
              Verify
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
