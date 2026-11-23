"use client";

import { FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClasses } from "@/features/admin/classes/hooks";
import {
  useCreateExam,
  useDeleteExam,
  useExams,
  useUpdateExamStatus,
} from "@/features/exams/hooks";
import type { ExamStatus, ExamType } from "@/features/exams/types";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function ExamsWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const { data: exams = [], isLoading, isError, error, refetch } =
    useExams(schoolId);
  const { data: classes = [] } = useClasses(canManage ? schoolId : 0);
  const createMut = useCreateExam(schoolId);
  const statusMut = useUpdateExamStatus(schoolId);
  const deleteMut = useDeleteExam(schoolId);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    classId: "",
    name: "",
    type: "HALF_YEARLY" as ExamType,
    academicYear: String(new Date().getFullYear()),
    startDate: "",
    endDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMut.mutateAsync({
      classId: Number(form.classId),
      name: form.name.trim(),
      type: form.type,
      academicYear: form.academicYear.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
    });
    setOpen(false);
    setForm({
      classId: "",
      name: "",
      type: "HALF_YEARLY",
      academicYear: String(new Date().getFullYear()),
      startDate: "",
      endDate: "",
    });
  };

  if (isLoading) return <LoadingState message="Loading examinations..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load exams")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Examinations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Examination schedules, academic terms, and completion statuses.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Schedule Exam
          </Button>
        )}
      </div>

      {exams.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No examinations scheduled"
          description="Scheduled exams will appear here."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Exam Name</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Status</th>
                {canManage && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {exams.map((ex) => (
                <tr key={ex.id}>
                  <td className="px-4 py-3 font-medium">
                    {ex.name}
                    <p className="text-xs text-muted-foreground">{ex.academicYear}</p>
                  </td>
                  <td className="px-4 py-3">{ex.class?.name ?? `Class #${ex.classId}`}</td>
                  <td className="px-4 py-3 text-xs">{ex.type.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(ex.startDate).toLocaleDateString()} –{" "}
                    {new Date(ex.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {canManage ? (
                      <select
                        value={ex.status}
                        onChange={(e) =>
                          statusMut.mutate({
                            id: ex.id,
                            status: e.target.value as ExamStatus,
                          })
                        }
                        className="h-8 rounded-md border bg-background px-2 text-xs"
                      >
                        <option value="UPCOMING">UPCOMING</option>
                        <option value="ONGOING">ONGOING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    ) : (
                      <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
                        {ex.status}
                      </span>
                    )}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMut.mutate(ex.id)}
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

      <Modal open={open} onClose={() => setOpen(false)} title="Schedule Examination">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Exam Name</Label>
            <Input
              required
              placeholder="Half-Yearly Exam 2026"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Class</Label>
              <select
                required
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
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
              <Label>Exam Type</Label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as ExamType })}
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="CLASS_TEST">Class Test</option>
                <option value="HALF_YEARLY">Half Yearly</option>
                <option value="ANNUAL">Annual</option>
                <option value="MODEL_TEST">Model Test</option>
                <option value="FINAL">Final</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Academic Year</Label>
              <Input
                required
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Start Date</Label>
              <Input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>End Date</Label>
              <Input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMut.isPending}>
              {createMut.isPending ? "Creating..." : "Create Exam"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
