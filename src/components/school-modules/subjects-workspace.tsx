"use client";

import { ClipboardList, Pencil, Plus, Power, Trash2 } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateSubject,
  useDeleteSubject,
  useSubjects,
  useToggleSubjectStatus,
  useUpdateSubject,
} from "@/features/subjects/hooks";
import type { SubjectRecord } from "@/features/subjects/types";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function SubjectsWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const {
    data: subjects = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSubjects(schoolId);
  const createMut = useCreateSubject(schoolId);
  const updateMut = useUpdateSubject(schoolId);
  const toggleMut = useToggleSubjectStatus(schoolId);
  const deleteMut = useDeleteSubject(schoolId);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    fullMarks: "100",
    passMarks: "33",
    description: "",
  });

  const [editTarget, setEditTarget] = useState<SubjectRecord | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  const openEditModal = (sub: SubjectRecord) => {
    setEditTarget(sub);
    setEditForm({
      name: sub.name,
      code: sub.code,
      description: sub.description ?? "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    await updateMut.mutateAsync({
      id: editTarget.id,
      payload: {
        name: editForm.name.trim(),
        code: editForm.code.trim(),
        ...(editForm.description.trim()
          ? { description: editForm.description.trim() }
          : {}),
      },
    });
    setEditTarget(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMut.mutateAsync({
      name: form.name.trim(),
      code: form.code.trim(),
      fullMarks: Number(form.fullMarks) || 100,
      passMarks: Number(form.passMarks) || 33,
      ...(form.description ? { description: form.description.trim() } : {}),
    });
    setOpen(false);
    setForm({
      name: "",
      code: "",
      fullMarks: "100",
      passMarks: "33",
      description: "",
    });
  };

  if (isLoading) return <LoadingState message="Loading subjects..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load subjects")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage curriculum subjects, codes, and pass/full marks.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Subject
          </Button>
        )}
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No subjects configured"
          description="Add subjects such as Quran, Hadith, Fiqh, Arabic, Math, or English."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Subject Name</th>
                <th className="px-4 py-3">Full / Pass Marks</th>
                <th className="px-4 py-3">Status</th>
                {canManage && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y">
              {subjects.map((sub) => (
                <tr key={sub.id}>
                  <td className="px-4 py-3 font-mono text-xs">{sub.code}</td>
                  <td className="px-4 py-3 font-medium">{sub.name}</td>
                  <td className="px-4 py-3">
                    {sub.fullMarks} / {sub.passMarks}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">
                      {sub.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(sub)}
                          className="gap-1"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleMut.mutate(sub.id)}
                          title="Toggle status"
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMut.mutate(sub.id)}
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

      <Modal open={open} onClose={() => setOpen(false)} title="Create Subject">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Subject Name</Label>
              <Input
                required
                placeholder="Quran Majeed"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Subject Code</Label>
              <Input
                required
                placeholder="QRN-101"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Full Marks</Label>
              <Input
                type="number"
                min={1}
                max={1000}
                value={form.fullMarks}
                onChange={(e) =>
                  setForm({ ...form, fullMarks: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Pass Marks</Label>
              <Input
                type="number"
                min={0}
                max={1000}
                value={form.passMarks}
                onChange={(e) =>
                  setForm({ ...form, passMarks: e.target.value })
                }
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
            <Button type="submit" disabled={createMut.isPending}>
              {createMut.isPending ? "Creating..." : "Create Subject"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Subject"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Subject Name *</Label>
              <Input
                required
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Subject Code *</Label>
              <Input
                required
                value={editForm.code}
                onChange={(e) =>
                  setEditForm({ ...editForm, code: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Input
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              placeholder="Optional subject description"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditTarget(null)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMut.isPending}>
              {updateMut.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
