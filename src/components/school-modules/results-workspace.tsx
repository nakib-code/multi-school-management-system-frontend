"use client";

import { Award, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEnrollments } from "@/features/enrollments/hooks";
import { useExams } from "@/features/exams/hooks";
import {
  useCreateResult,
  useDeleteResult,
  useResults,
} from "@/features/results/hooks";
import { useSubjects } from "@/features/subjects/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function ResultsWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const canRecord =
    user?.role === "ADMIN" ||
    user?.role === "MANAGER" ||
    user?.role === "TEACHER";
  const canDelete = user?.role === "ADMIN" || user?.role === "MANAGER";

  const { data: results = [], isLoading, isError, error, refetch } =
    useResults(schoolId);
  const { data: enrollments = [] } = useEnrollments(canRecord ? schoolId : 0);
  const { data: exams = [] } = useExams(canRecord ? schoolId : 0);
  const { data: subjects = [] } = useSubjects(canRecord ? schoolId : 0);

  const createMut = useCreateResult(schoolId);
  const deleteMut = useDeleteResult(schoolId);

  const [open, setOpen] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState("");
  const [examId, setExamId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [marks, setMarks] = useState("");
  const [remarks, setRemarks] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const en = enrollments.find((item) => item.id === Number(enrollmentId));
    if (!en) return;
    await createMut.mutateAsync({
      studentId: en.studentId,
      enrollmentId: en.id,
      examId: Number(examId),
      subjectId: Number(subjectId),
      marks: Number(marks),
      ...(remarks.trim() ? { remarks: remarks.trim() } : {}),
    });
    setOpen(false);
    setMarks("");
    setRemarks("");
  };

  if (isLoading) return <LoadingState message="Loading results..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load results")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Results &amp; GPA Grades
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Examination marks with automatic BD 5.0 GPA grade calculation.
          </p>
        </div>
        {canRecord && (
          <Button onClick={() => setOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Record Result
          </Button>
        )}
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No results recorded yet"
          description="Published examination marks and grades will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Exam</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Marks</th>
                <th className="px-4 py-3">Grade / GPA</th>
                {canDelete && <th className="px-4 py-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {results.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium">
                    {r.student
                      ? `${r.student.firstName} ${r.student.lastName ?? ""}`
                      : `Student #${r.studentId}`}
                  </td>
                  <td className="px-4 py-3">{r.exam?.name ?? `Exam #${r.examId}`}</td>
                  <td className="px-4 py-3">{r.subject?.name ?? `Subject #${r.subjectId}`}</td>
                  <td className="px-4 py-3 font-medium">
                    {r.marks} / {r.subject?.fullMarks ?? 100}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {r.grade.replace("_PLUS", "+").replace("_MINUS", "-")} ({r.gradePoint})
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

      <Modal open={open} onClose={() => setOpen(false)} title="Record Exam Result">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Enrolled Student</Label>
            <select
              required
              value={enrollmentId}
              onChange={(e) => setEnrollmentId(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Select enrollment...</option>
              {enrollments.map((en) => (
                <option key={en.id} value={en.id}>
                  {en.student
                    ? `${en.student.firstName} ${en.student.lastName ?? ""} (${en.class?.name ?? ""})`
                    : `Enrollment #${en.id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Exam</Label>
              <select
                required
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select exam...</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Subject</Label>
              <select
                required
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select subject...</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} (Max {sub.fullMarks})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Marks Obtained</Label>
              <Input
                type="number"
                step="0.5"
                min={0}
                required
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Remarks (Optional)</Label>
              <Input
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMut.isPending}>
              {createMut.isPending ? "Saving..." : "Save Result"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
