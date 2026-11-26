"use client";

import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  Megaphone,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClasses, useSections } from "@/features/admin/classes/hooks";
import {
  type BroadcastNotificationInput,
  useBroadcastNotification,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/features/notifications/hooks";
import { useTeacherAssignments } from "@/features/teachers/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const TYPE_BADGE_STYLES: Record<string, string> = {
  EMERGENCY: "border-red-300 bg-red-600 text-white",
  ATTENDANCE: "border-amber-200 bg-amber-500/15 text-amber-800",
  DIARY: "border-emerald-200 bg-emerald-500/15 text-emerald-800",
  ANNOUNCEMENT: "border-blue-200 bg-blue-500/15 text-blue-800",
};

export default function NotificationsHistoryPage() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;
  const role = user?.role ?? "";
  const isTeacher = role === "TEACHER";
  const isStaffManager = role === "ADMIN" || role === "MANAGER";
  const canBroadcast = isStaffManager || isTeacher;

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [composeOpen, setComposeOpen] = useState(false);

  const [broadcastForm, setBroadcastForm] = useState<{
    type: "ANNOUNCEMENT" | "EMERGENCY";
    audience: BroadcastNotificationInput["audience"];
    classId: string;
    sectionId: string;
    title: string;
    message: string;
  }>({
    type: "ANNOUNCEMENT",
    audience: isTeacher ? "CLASS" : "ALL",
    classId: "",
    sectionId: "",
    title: "",
    message: "",
  });

  const { data, isLoading, isError, error, refetch } = useNotifications({
    page,
    limit: 15,
    ...(filter === "unread" ? { isRead: false } : {}),
  });

  const { data: allClasses = [] } = useClasses(canBroadcast ? schoolId : 0);
  const { data: allSections = [] } = useSections(canBroadcast ? schoolId : 0);
  const { data: teacherAssignments = [] } = useTeacherAssignments(
    isTeacher ? schoolId : 0,
  );

  const markReadMut = useMarkNotificationRead();
  const markAllMut = useMarkAllNotificationsRead();
  const deleteMut = useDeleteNotification();
  const broadcastMut = useBroadcastNotification();

  const availableClasses = useMemo(() => {
    if (!isTeacher) return allClasses;
    const assigned = new Set(teacherAssignments.map((a) => a.classId));
    return allClasses.filter((c) => assigned.has(c.id));
  }, [isTeacher, allClasses, teacherAssignments]);

  const availableSections = useMemo(() => {
    const cid = Number(broadcastForm.classId);
    if (!cid) return [];
    const byClass = allSections.filter((s) => s.classId === cid);
    if (!isTeacher) return byClass;
    const assigned = new Set(
      teacherAssignments
        .filter((a) => a.classId === cid)
        .map((a) => a.sectionId),
    );
    return byClass.filter((s) => assigned.has(s.id));
  }, [isTeacher, allSections, broadcastForm.classId, teacherAssignments]);

  const openComposer = () => {
    setBroadcastForm({
      type: "ANNOUNCEMENT",
      audience: isTeacher ? "CLASS" : "ALL",
      classId:
        isTeacher && availableClasses[0] ? String(availableClasses[0].id) : "",
      sectionId: "",
      title: "",
      message: "",
    });
    setComposeOpen(true);
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    await broadcastMut.mutateAsync({
      type: broadcastForm.type,
      audience: isTeacher ? "CLASS" : broadcastForm.audience,
      ...(broadcastForm.classId
        ? { classId: Number(broadcastForm.classId) }
        : {}),
      ...(broadcastForm.sectionId
        ? { sectionId: Number(broadcastForm.sectionId) }
        : {}),
      title: broadcastForm.title.trim(),
      message: broadcastForm.message.trim(),
    });
    setComposeOpen(false);
  };

  const notifications = data?.notifications ?? [];
  const meta = data?.meta;
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time alerts across attendance, daily diary, notices, and
              emergencies ({unreadCount} unread).
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
            {canBroadcast && (
              <Button
                size="sm"
                onClick={openComposer}
                className="min-h-[44px] w-full gap-1.5 rounded-[11px] sm:min-h-0 sm:w-auto"
              >
                <Megaphone className="h-4 w-4" />
                Send Notice / Alert
              </Button>
            )}
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value as "all" | "unread");
                setPage(1);
              }}
              className="h-10 w-full rounded-[11px] border bg-background px-3 text-sm sm:h-9 sm:w-auto"
            >
              <option value="all">All</option>
              <option value="unread">Unread Only</option>
            </select>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => markAllMut.mutate()}
                disabled={markAllMut.isPending}
                className="min-h-[44px] w-full gap-1.5 rounded-[11px] sm:min-h-0 sm:w-auto"
              >
                <CheckCheck className="h-4 w-4" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <LoadingState message="Loading notifications..." />
        ) : isError ? (
          <ErrorState
            message={getApiErrorMessage(error, "Failed to load notifications")}
            onRetry={() => refetch()}
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You have no notifications matching this filter."
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${
                  n.type === "EMERGENCY"
                    ? "border-red-300 bg-red-50/70 dark:border-red-900 dark:bg-red-950/30"
                    : n.isRead
                      ? "bg-card"
                      : "border-primary/30 bg-primary/5"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        TYPE_BADGE_STYLES[n.type] ?? ""
                      }`}
                    >
                      {n.type === "EMERGENCY" && (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {n.type}
                    </span>
                    <p className="text-sm font-semibold">{n.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {!n.isRead && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markReadMut.mutate(n.id)}
                      className="gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Read
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMut.mutate(n.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Broadcast Composer Modal */}
      <Modal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="Send Notice or Emergency Alert"
        maxWidthClass="max-w-lg"
      >
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                setBroadcastForm({ ...broadcastForm, type: "ANNOUNCEMENT" })
              }
              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                broadcastForm.type === "ANNOUNCEMENT"
                  ? "border-primary bg-primary/10 text-primary"
                  : "hover:bg-muted"
              }`}
            >
              {isTeacher ? "Class Notice" : "Regular Notice"}
            </button>
            <button
              type="button"
              onClick={() =>
                setBroadcastForm({ ...broadcastForm, type: "EMERGENCY" })
              }
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                broadcastForm.type === "EMERGENCY"
                  ? "border-red-500 bg-red-600 text-white"
                  : "hover:bg-muted"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Emergency Alert
            </button>
          </div>

          {!isTeacher && (
            <div className="space-y-1">
              <Label>Target Audience *</Label>
              <select
                value={broadcastForm.audience}
                onChange={(e) =>
                  setBroadcastForm({
                    ...broadcastForm,
                    audience: e.target
                      .value as BroadcastNotificationInput["audience"],
                  })
                }
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="ALL">
                  All School (Teachers, Guardians &amp; Students)
                </option>
                <option value="TEACHERS">All Teachers</option>
                <option value="GUARDIANS">All Guardians</option>
                <option value="STUDENTS">All Students</option>
                <option value="CLASS">Specific Class / Section</option>
              </select>
            </div>
          )}

          {(isTeacher || broadcastForm.audience === "CLASS") && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Class *</Label>
                <select
                  required
                  value={broadcastForm.classId}
                  onChange={(e) =>
                    setBroadcastForm({
                      ...broadcastForm,
                      classId: e.target.value,
                      sectionId: "",
                    })
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
                <Label>Section (Optional)</Label>
                <select
                  value={broadcastForm.sectionId}
                  disabled={!broadcastForm.classId}
                  onChange={(e) =>
                    setBroadcastForm({
                      ...broadcastForm,
                      sectionId: e.target.value,
                    })
                  }
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm disabled:opacity-50"
                >
                  <option value="">All sections</option>
                  {availableSections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label>Title *</Label>
            <Input
              required
              value={broadcastForm.title}
              onChange={(e) =>
                setBroadcastForm({ ...broadcastForm, title: e.target.value })
              }
              placeholder={
                broadcastForm.type === "EMERGENCY"
                  ? "e.g. Early Dismissal Due to Heavy Rain"
                  : "e.g. Tomorrow's Assembly Notice"
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Message *</Label>
            <textarea
              required
              rows={4}
              value={broadcastForm.message}
              onChange={(e) =>
                setBroadcastForm({ ...broadcastForm, message: e.target.value })
              }
              placeholder="Write clear instructions for recipients..."
              className="w-full rounded-md border bg-background p-2.5 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setComposeOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={broadcastMut.isPending}
              className={
                broadcastForm.type === "EMERGENCY"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : ""
              }
            >
              {broadcastMut.isPending
                ? "Sending..."
                : broadcastForm.type === "EMERGENCY"
                  ? "Send Emergency Alert"
                  : "Send Notice"}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
