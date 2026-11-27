"use client";

import { CalendarDays, Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClasses, useSections } from "@/features/admin/classes/hooks";
import {
  type ClassRoutineRecord,
  type DayOfWeek,
  useClassRoutines,
  useCreateClassRoutine,
  useDeleteClassRoutine,
  useUpdateRoutine,
} from "@/features/routines/hooks";
import { useSubjects } from "@/features/subjects/hooks";
import { useTeachers } from "@/features/teachers/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const DAYS: DayOfWeek[] = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];

export function RoutineWorkspace() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [classFilter, setClassFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ClassRoutineRecord | null>(null);
  const [form, setForm] = useState({
    classId: "",
    sectionId: "",
    subjectId: "",
    teacherId: "",
    dayOfWeek: "SUNDAY" as DayOfWeek,
    startTime: "09:00",
    endTime: "09:45",
    roomNumber: "",
    academicYear: String(new Date().getFullYear()),
  });
  const [editForm, setEditForm] = useState({
    dayOfWeek: "SUNDAY" as DayOfWeek,
    periodNumber: "",
    startTime: "09:00",
    endTime: "09:45",
    roomNumber: "",
    subjectId: "",
    teacherId: "",
  });

  const routinesQuery = useClassRoutines(
    schoolId,
    classFilter ? { classId: Number(classFilter) } : undefined,
  );
  const { data: classes = [] } = useClasses(canManage ? schoolId : 0);
  const { data: sections = [] } = useSections(canManage ? schoolId : 0);
  const { data: subjects = [] } = useSubjects(canManage ? schoolId : 0);
  const { data: teachers = [] } = useTeachers(canManage ? schoolId : 0);

  const createMut = useCreateClassRoutine(schoolId);
  const updateMut = useUpdateRoutine(schoolId);
  const deleteMut = useDeleteClassRoutine(schoolId);

  const routines = routinesQuery.data ?? [];

  const groupedByDay = useMemo(() => {
    const map: Record<DayOfWeek, typeof routines> = {
      SATURDAY: [],
      SUNDAY: [],
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
    };
    for (const r of routines) {
      map[r.dayOfWeek]?.push(r);
    }
    return map;
  }, [routines]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMut.mutateAsync({
      classId: Number(form.classId),
      ...(form.sectionId
        ? { sectionId: Number(form.sectionId) }
        : { sectionId: null }),
      subjectId: Number(form.subjectId),
      teacherId: Number(form.teacherId),
      dayOfWeek: form.dayOfWeek,
      startTime: form.startTime,
      endTime: form.endTime,
      ...(form.roomNumber.trim()
        ? { roomNumber: form.roomNumber.trim() }
        : { roomNumber: null }),
      academicYear: form.academicYear.trim(),
    });
    setOpen(false);
  };

  const openEdit = (slot: ClassRoutineRecord) => {
    setEditTarget(slot);
    setEditForm({
      dayOfWeek: slot.dayOfWeek,
      periodNumber: "",
      startTime: slot.startTime,
      endTime: slot.endTime,
      roomNumber: slot.roomNumber ?? "",
      subjectId: String(slot.subjectId),
      teacherId: String(slot.teacherId),
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    await updateMut.mutateAsync({
      id: editTarget.id,
      payload: {
        dayOfWeek: editForm.dayOfWeek,
        ...(editForm.periodNumber !== ""
          ? { periodNumber: Number(editForm.periodNumber) }
          : {}),
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        roomNumber: editForm.roomNumber.trim() || null,
        subjectId: Number(editForm.subjectId),
        teacherId: editForm.teacherId ? Number(editForm.teacherId) : null,
      },
    });
    setEditTarget(null);
  };

  if (routinesQuery.isLoading)
    return <LoadingState message="Loading class timetable..." />;
  if (routinesQuery.isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(
          routinesQuery.error,
          "Failed to load class routine",
        )}
        onRetry={() => routinesQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Class Routine &amp; Timetable
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Weekly schedule with automatic teacher, class, and room conflict
            prevention.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManage && classes.length > 0 && (
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          {canManage && (
            <Button onClick={() => setOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Period
            </Button>
          )}
        </div>
      </div>

      {routines.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No routine slots scheduled"
          description="Weekly class timetable slots will appear here once configured."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DAYS.filter((day) => groupedByDay[day].length > 0).map((day) => (
            <div key={day} className="rounded-xl border bg-card p-4">
              <h2 className="mb-3 border-b pb-2 text-sm font-bold tracking-wide text-primary">
                {day}
              </h2>
              <div className="space-y-2.5">
                {groupedByDay[day].map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-start justify-between gap-2 rounded-lg border bg-background p-3"
                  >
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {slot.startTime} – {slot.endTime}
                      </div>
                      <p className="text-sm font-semibold">
                        {slot.subject?.name ?? `Subject #${slot.subjectId}`}
                      </p>
                      <p className="text-muted-foreground">
                        {slot.class?.name ?? `Class #${slot.classId}`}
                        {slot.section ? ` (${slot.section.name})` : ""}
                        {slot.roomNumber ? ` • Room ${slot.roomNumber}` : ""}
                      </p>
                      <p className="text-muted-foreground">
                        Teacher:{" "}
                        {slot.teacher
                          ? `${slot.teacher.firstName} ${slot.teacher.lastName ?? ""}`
                          : `#${slot.teacherId}`}
                      </p>
                    </div>
                    {canManage && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(slot)}
                          className="h-7 w-7 p-0"
                          title="Edit period"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMut.mutate(slot.id)}
                          className="h-7 w-7 p-0 text-destructive"
                          title="Delete period"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Timetable Period"
      >
        <form onSubmit={handleCreate} className="space-y-4">
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
              <Label>Section (Optional)</Label>
              <select
                value={form.sectionId}
                onChange={(e) =>
                  setForm({ ...form, sectionId: e.target.value })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">All / None</option>
                {sections
                  .filter(
                    (s) => !form.classId || s.classId === Number(form.classId),
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
                value={form.subjectId}
                onChange={(e) =>
                  setForm({ ...form, subjectId: e.target.value })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select subject...</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Teacher</Label>
              <select
                required
                value={form.teacherId}
                onChange={(e) =>
                  setForm({ ...form, teacherId: e.target.value })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select teacher...</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName ?? ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Day</Label>
              <select
                value={form.dayOfWeek}
                onChange={(e) =>
                  setForm({ ...form, dayOfWeek: e.target.value as DayOfWeek })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Start Time</Label>
              <Input
                type="time"
                required
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>End Time</Label>
              <Input
                type="time"
                required
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Room Number (Optional)</Label>
              <Input
                placeholder="Room 204"
                value={form.roomNumber}
                onChange={(e) =>
                  setForm({ ...form, roomNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Academic Year</Label>
              <Input
                required
                value={form.academicYear}
                onChange={(e) =>
                  setForm({ ...form, academicYear: e.target.value })
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
              {createMut.isPending ? "Saving..." : "Save Period"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Routine Period"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Subject</Label>
              <select
                required
                value={editForm.subjectId}
                onChange={(e) =>
                  setEditForm({ ...editForm, subjectId: e.target.value })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Select subject...</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Teacher</Label>
              <select
                value={editForm.teacherId}
                onChange={(e) =>
                  setEditForm({ ...editForm, teacherId: e.target.value })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Unassigned</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName ?? ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Day</Label>
              <select
                value={editForm.dayOfWeek}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    dayOfWeek: e.target.value as DayOfWeek,
                  })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Period Number (Optional)</Label>
              <Input
                type="number"
                min={1}
                placeholder="e.g. 1"
                value={editForm.periodNumber}
                onChange={(e) =>
                  setEditForm({ ...editForm, periodNumber: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Start Time</Label>
              <Input
                type="time"
                required
                value={editForm.startTime}
                onChange={(e) =>
                  setEditForm({ ...editForm, startTime: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>End Time</Label>
              <Input
                type="time"
                required
                value={editForm.endTime}
                onChange={(e) =>
                  setEditForm({ ...editForm, endTime: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Room Number</Label>
              <Input
                placeholder="Room 204"
                value={editForm.roomNumber}
                onChange={(e) =>
                  setEditForm({ ...editForm, roomNumber: e.target.value })
                }
              />
            </div>
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
