"use client";

import {
  BookOpen,
  Calendar,
  ExternalLink,
  Paperclip,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FileUpload } from "@/components/shared/file-upload";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClasses, useSections } from "@/features/admin/classes/hooks";
import {
  useClassDiaries,
  useCreateClassDiary,
  useDeleteClassDiary,
  useUpdateClassDiary,
} from "@/features/class-diary/hooks";
import type { ClassDiaryRecord } from "@/features/class-diary/types";
import { useSubjects } from "@/features/subjects/hooks";
import { useTeacherAssignments } from "@/features/teachers/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const todayIso = () => new Date().toISOString().slice(0, 10);

export function ClassDiaryWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const role = user?.role ?? "";
  const isTeacher = role === "TEACHER";
  const canWrite = role === "ADMIN" || role === "MANAGER" || isTeacher;

  const [filterDate, setFilterDate] = useState(todayIso);
  const [filterClassId, setFilterClassId] = useState("");
  const [filterSectionId, setFilterSectionId] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClassDiaryRecord | null>(null);
  const [form, setForm] = useState({
    classId: "",
    sectionId: "",
    subjectId: "",
    diaryDate: todayIso(),
    title: "",
    classwork: "",
    homework: "",
    dueDate: "",
    attachmentUrl: "",
  });

  const diariesQuery = useClassDiaries(schoolId, {
    ...(filterDate ? { date: filterDate } : {}),
    ...(filterClassId ? { classId: Number(filterClassId) } : {}),
    ...(filterSectionId ? { sectionId: Number(filterSectionId) } : {}),
  });

  const { data: allClasses = [] } = useClasses(canWrite ? schoolId : 0);
  const { data: allSections = [] } = useSections(canWrite ? schoolId : 0);
  const { data: subjects = [] } = useSubjects(canWrite ? schoolId : 0);
  const { data: teacherAssignments = [] } = useTeacherAssignments(
    isTeacher ? schoolId : 0,
  );

  const createMut = useCreateClassDiary(schoolId);
  const updateMut = useUpdateClassDiary(schoolId);
  const deleteMut = useDeleteClassDiary(schoolId);

  const availableClasses = useMemo(() => {
    if (!isTeacher) return allClasses;
    const assignedClassIds = new Set(teacherAssignments.map((a) => a.classId));
    return allClasses.filter((c) => assignedClassIds.has(c.id));
  }, [isTeacher, allClasses, teacherAssignments]);

  const getSectionsForClass = (classIdStr: string) => {
    const cid = Number(classIdStr);
    if (!cid) return [];
    const byClass = allSections.filter((s) => s.classId === cid);
    if (!isTeacher) return byClass;
    const assignedSectionIds = new Set(
      teacherAssignments
        .filter((a) => a.classId === cid)
        .map((a) => a.sectionId),
    );
    return byClass.filter((s) => assignedSectionIds.has(s.id));
  };

  const openCreateModal = () => {
    setEditing(null);
    setForm({
      classId: filterClassId || (availableClasses[0] ? String(availableClasses[0].id) : ""),
      sectionId: filterSectionId || "",
      subjectId: "",
      diaryDate: filterDate || todayIso(),
      title: "",
      classwork: "",
      homework: "",
      dueDate: "",
      attachmentUrl: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (diary: ClassDiaryRecord) => {
    setEditing(diary);
    setForm({
      classId: String(diary.classId),
      sectionId: diary.sectionId ? String(diary.sectionId) : "",
      subjectId: diary.subjectId ? String(diary.subjectId) : "",
      diaryDate: new Date(diary.diaryDate).toISOString().slice(0, 10),
      title: diary.title ?? "",
      classwork: diary.classwork,
      homework: diary.homework ?? "",
      dueDate: diary.dueDate
        ? new Date(diary.dueDate).toISOString().slice(0, 10)
        : "",
      attachmentUrl: diary.attachmentUrl ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      classId: Number(form.classId),
      sectionId: form.sectionId ? Number(form.sectionId) : null,
      subjectId: form.subjectId ? Number(form.subjectId) : null,
      diaryDate: form.diaryDate,
      title: form.title.trim() || null,
      classwork: form.classwork.trim(),
      homework: form.homework.trim() || null,
      dueDate: form.dueDate || null,
      attachmentUrl: form.attachmentUrl.trim() || null,
    };

    if (editing) {
      await updateMut.mutateAsync({ id: editing.id, payload });
    } else {
      await createMut.mutateAsync(payload);
    }
    setModalOpen(false);
  };

  if (diariesQuery.isLoading) {
    return <LoadingState message="Loading daily class diary..." />;
  }
  if (diariesQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          diariesQuery.error,
          "Failed to load class diary",
        )}
        onRetry={() => diariesQuery.refetch()}
      />
    );
  }

  const diaries = diariesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Daily Class Diary &amp; Homework
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {canWrite
              ? "Post daily classwork & homework — guardians and students receive instant in-app alerts."
              : "Review daily classwork, homework, due dates, and teacher attachments."}
          </p>
        </div>

        {canWrite && (
          <Button
            onClick={openCreateModal}
            className="min-h-[44px] w-full gap-1.5 rounded-[11px] sm:min-h-0 sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Post Daily Diary
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="mobile-filter-bar">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Date</Label>
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="h-10 w-full rounded-[11px] sm:h-9 sm:w-44"
          />
        </div>

        {filterDate && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setFilterDate("")}
            className="min-h-[44px] w-full sm:min-h-0 sm:w-auto"
          >
            Show All Dates
          </Button>
        )}

        {canWrite && (
          <>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Class</Label>
              <select
                value={filterClassId}
                onChange={(e) => {
                  setFilterClassId(e.target.value);
                  setFilterSectionId("");
                }}
                className="h-10 w-full rounded-[11px] border bg-background px-3 text-sm sm:h-9 sm:w-auto"
              >
                <option value="">All Classes</option>
                {availableClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Section</Label>
              <select
                value={filterSectionId}
                disabled={!filterClassId}
                onChange={(e) => setFilterSectionId(e.target.value)}
                className="h-10 w-full rounded-[11px] border bg-background px-3 text-sm disabled:opacity-50 sm:h-9 sm:w-auto"
              >
                <option value="">All Sections</option>
                {getSectionsForClass(filterClassId).map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* Diary Cards */}
      {diaries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No diary entries found"
          description={
            filterDate
              ? `No class diary posted for ${filterDate}. Try clearing the date filter or posting a new entry.`
              : "Daily classwork and homework entries will appear here."
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {diaries.map((d) => (
            <div
              key={d.id}
              className="flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-semibold text-emerald-700">
                        {d.class.name}
                        {d.section ? ` • ${d.section.name}` : ""}
                      </span>
                      {d.subject && (
                        <span className="rounded-full border px-2.5 py-0.5 font-medium">
                          {d.subject.name}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(d.diaryDate).toLocaleDateString()}
                      </span>
                    </div>
                    {d.title && (
                      <h3 className="mt-2 text-base font-semibold">
                        {d.title}
                      </h3>
                    )}
                  </div>

                  {canWrite && (
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(d)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMut.mutate(d.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-muted/30 p-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Classwork
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{d.classwork}</p>
                </div>

                {d.homework && (
                  <div className="rounded-xl border border-amber-200/70 bg-amber-50/40 p-3 text-sm dark:border-amber-900/50 dark:bg-amber-950/20">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-400">
                        Homework
                      </p>
                      {d.dueDate && (
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                          Due: {new Date(d.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap">{d.homework}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
                <span>
                  Posted by{" "}
                  <strong className="text-foreground">
                    {d.teacher
                      ? `${d.teacher.firstName} ${d.teacher.lastName ?? ""}`
                      : d.createdBy.name}
                  </strong>
                </span>
                {d.attachmentUrl && (
                  <a
                    href={d.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    Attachment
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Daily Diary" : "Post Daily Class Diary"}
        maxWidthClass="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Date *</Label>
              <Input
                type="date"
                required
                value={form.diaryDate}
                onChange={(e) =>
                  setForm({ ...form, diaryDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Class *</Label>
              <select
                required
                value={form.classId}
                onChange={(e) =>
                  setForm({ ...form, classId: e.target.value, sectionId: "" })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select class...</option>
                {availableClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Section</Label>
              <select
                value={form.sectionId}
                disabled={!form.classId}
                onChange={(e) =>
                  setForm({ ...form, sectionId: e.target.value })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-50"
              >
                <option value="">All sections</option>
                {getSectionsForClass(form.classId).map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Subject (Optional)</Label>
              <select
                value={form.subjectId}
                onChange={(e) =>
                  setForm({ ...form, subjectId: e.target.value })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">General / All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Topic / Title (Optional)</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Chapter 4 — Fractions"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Today&apos;s Classwork *</Label>
            <textarea
              required
              rows={3}
              value={form.classwork}
              onChange={(e) => setForm({ ...form, classwork: e.target.value })}
              placeholder="Summarize what was taught in class today..."
              className="w-full rounded-md border bg-background p-2.5 text-sm"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1 sm:col-span-2">
              <Label>Homework (Optional)</Label>
              <textarea
                rows={2}
                value={form.homework}
                onChange={(e) => setForm({ ...form, homework: e.target.value })}
                placeholder="Exercises, reading, memorization..."
                className="w-full rounded-md border bg-background p-2.5 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label>Due Date (Optional)</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          <FileUpload
            category="DOCUMENT"
            label="Worksheet / Attachment (Optional)"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            currentUrl={form.attachmentUrl}
            onUploaded={(file) => setForm({ ...form, attachmentUrl: file.url })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMut.isPending || updateMut.isPending}
            >
              {editing ? "Save Changes" : "Post & Notify Guardians"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
