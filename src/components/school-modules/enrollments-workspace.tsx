"use client";

import { FileCheck, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClasses, useSections } from "@/features/admin/classes/hooks";
import {
  useCreateEnrollment,
  useDeleteEnrollment,
  useEnrollments,
} from "@/features/enrollments/hooks";
import { useStudents } from "@/features/students/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function EnrollmentsWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const {
    data: enrollments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useEnrollments(schoolId);
  const { data: studentsData } = useStudents(schoolId, { page: 1, limit: 100 });
  const { data: classes = [] } = useClasses(schoolId);
  const { data: sections = [] } = useSections(schoolId);

  const createMutation = useCreateEnrollment(schoolId);
  const deleteMutation = useDeleteEnrollment(schoolId);

  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [academicYear, setAcademicYear] = useState(
    String(new Date().getFullYear()),
  );
  const [rollNumber, setRollNumber] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      studentId: Number(studentId),
      classId: Number(classId),
      ...(sectionId ? { sectionId: Number(sectionId) } : {}),
      academicYear: academicYear.trim(),
      ...(rollNumber ? { rollNumber: Number(rollNumber) } : {}),
    });
    setOpen(false);
    setStudentId("");
    setClassId("");
    setSectionId("");
    setRollNumber("");
  };

  if (isLoading) return <LoadingState message="Loading enrollments..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load enrollments")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Student Enrollments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Assign students to classes, sections, academic years, and roll
            numbers.
          </p>
        </div>

        {canManage && (
          <Button onClick={() => setOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Enroll Student
          </Button>
        )}
      </div>

      {enrollments.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No enrollments yet"
          description="Enroll students into classes and sections for the current academic year."
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
                  <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold">
                    {en.status}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {en.class?.name ?? `Class #${en.classId}`}
                  {en.section ? ` — ${en.section.name}` : ""} •{" "}
                  {en.academicYear} • Roll: {en.rollNumber ?? "—"}
                </p>
                {canManage && (
                  <div className="flex justify-end border-t pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(en.id)}
                      disabled={deleteMutation.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="surface-panel hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Class &amp; Section</th>
                  <th className="px-4 py-3">Academic Year</th>
                  <th className="px-4 py-3">Roll</th>
                  <th className="px-4 py-3">Status</th>
                  {canManage && (
                    <th className="px-4 py-3 text-right">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {enrollments.map((en) => (
                  <tr key={en.id}>
                    <td className="px-4 py-3 font-medium">
                      {en.student
                        ? `${en.student.firstName} ${en.student.lastName ?? ""} (${en.student.studentId})`
                        : `Student #${en.studentId}`}
                    </td>
                    <td className="px-4 py-3">
                      {en.class?.name ?? `Class #${en.classId}`}
                      {en.section ? ` — ${en.section.name}` : ""}
                    </td>
                    <td className="px-4 py-3">{en.academicYear}</td>
                    <td className="px-4 py-3">{en.rollNumber ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
                        {en.status}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(en.id)}
                          disabled={deleteMutation.isPending}
                          className="text-destructive hover:text-destructive"
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

      <Modal open={open} onClose={() => setOpen(false)} title="Enroll Student">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Student</Label>
            <select
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Class</Label>
              <select
                required
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select class...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Section (Optional)</Label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">None</option>
                {sections
                  .filter((sec) => !classId || sec.classId === Number(classId))
                  .map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name} ({sec.code})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Academic Year</Label>
              <Input
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2026"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Roll Number (Optional)</Label>
              <Input
                type="number"
                min={1}
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Enrolling..." : "Enroll"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
