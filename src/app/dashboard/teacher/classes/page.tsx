"use client";

import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading";
import { useTeacherAssignments } from "@/features/teachers/hooks";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export default function TeacherClassesPage() {
  const { user } = useAuth();
  const schoolId = user?.schoolId ?? 0;

  const { data: assignments = [], isLoading, isError, error, refetch } =
    useTeacherAssignments(schoolId);

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
        <h1 className="text-2xl font-bold tracking-tight">My Assigned Classes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Classes, sections, and subjects assigned to teachers in your institution.
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
          {assignments.map((a) => (
            <div key={a.id} className="rounded-xl border bg-card p-5">
              <p className="text-xs font-semibold uppercase text-primary">
                {a.academicYear}
              </p>
              <h3 className="mt-1 text-lg font-semibold">
                {a.class?.name ?? `Class #${a.classId}`} — {a.section?.name ?? a.sectionId}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Subject: {a.subject?.name ?? `Subject #${a.subjectId}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
