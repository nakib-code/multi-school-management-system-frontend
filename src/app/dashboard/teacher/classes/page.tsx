"use client";

import { AlertTriangle, BookOpen, Megaphone } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/modals/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBroadcastNotification } from "@/features/notifications/hooks";
import { useTeacherAssignments } from "@/features/teachers/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export default function TeacherClassesPage() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;

  const {
    data: assignments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTeacherAssignments(schoolId);
  const broadcastMut = useBroadcastNotification();

  const [target, setTarget] = useState<{
    classId: number;
    sectionId: number;
    label: string;
  } | null>(null);
  const [type, setType] = useState<"ANNOUNCEMENT" | "EMERGENCY">("ANNOUNCEMENT");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    await broadcastMut.mutateAsync({
      type,
      audience: "CLASS",
      classId: target.classId,
      sectionId: target.sectionId,
      title: title.trim(),
      message: message.trim(),
    });
    setTarget(null);
    setTitle("");
    setMessage("");
  };

  if (isLoading) return <LoadingState message="Loading assigned classes..." />;
  if (isError) {
    return (
      <ErrorState
        message={getApiErrorMessage(error, "Failed to load class assignments")}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          My Assigned Classes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Classes, sections, and subjects assigned to you. Send instant notices
          or emergency alerts directly to your class guardians &amp; students.
        </p>
      </div>

      {assignments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No class assignments yet"
          description="Your institution admin will assign classes and subjects to you."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((a) => {
            const label = `${a.class?.name ?? `Class #${a.classId}`} — ${a.section?.name ?? a.sectionId}`;
            return (
              <div
                key={a.id}
                className="flex flex-col justify-between rounded-xl border bg-card p-5"
              >
                <div>
                  <p className="text-xs font-semibold uppercase text-primary">
                    {a.academicYear}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">{label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Subject: {a.subject?.name ?? `Subject #${a.subjectId}`}
                  </p>
                </div>

                <div className="mt-4 flex gap-2 border-t pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTarget({
                        classId: a.classId,
                        sectionId: a.sectionId,
                        label,
                      });
                      setType("ANNOUNCEMENT");
                    }}
                    className="flex-1 gap-1 text-xs"
                  >
                    <Megaphone className="h-3.5 w-3.5" />
                    Class Notice
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTarget({
                        classId: a.classId,
                        sectionId: a.sectionId,
                        label,
                      });
                      setType("EMERGENCY");
                    }}
                    className="flex-1 gap-1 border-red-200 text-xs text-red-600 hover:bg-red-50"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Emergency
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={target !== null}
        onClose={() => setTarget(null)}
        title={
          target
            ? `${type === "EMERGENCY" ? "Emergency Alert" : "Class Notice"} — ${target.label}`
            : "Send Class Notice"
        }
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("ANNOUNCEMENT")}
              className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                type === "ANNOUNCEMENT"
                  ? "border-primary bg-primary/10 text-primary"
                  : "hover:bg-muted"
              }`}
            >
              Class Notice
            </button>
            <button
              type="button"
              onClick={() => setType("EMERGENCY")}
              className={`inline-flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold ${
                type === "EMERGENCY"
                  ? "border-red-500 bg-red-600 text-white"
                  : "hover:bg-muted"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Emergency Alert
            </button>
          </div>

          <div className="space-y-1">
            <Label>Title *</Label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short subject line"
            />
          </div>

          <div className="space-y-1">
            <Label>Message *</Label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Will be delivered instantly to all linked guardians & students of this class..."
              className="w-full rounded-md border bg-background p-2.5 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={broadcastMut.isPending}
              className={
                type === "EMERGENCY"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : ""
              }
            >
              {broadcastMut.isPending ? "Sending..." : "Send to Class"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
