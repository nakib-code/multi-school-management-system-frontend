"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

import { useCurrentUser } from "@/features/auth/hooks";
import { useDashboard } from "@/features/dashboard/hooks";
import type { SchoolDashboard } from "@/features/dashboard/types";

import type { SchoolClass } from "@/features/admin/classes/types";
import { SectionManagement } from "@/components/admin/section/section-management";
import { ClassManagement } from "@/components/admin/classes/class-management";

export default function ClassesPage() {
  const { data: user, isLoading: isUserLoading } =
    useCurrentUser();

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    refetch,
  } = useDashboard();

  const [selectedClass, setSelectedClass] =
    useState<SchoolClass | null>(null);

  if (isUserLoading || isDashboardLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading classes...
        </div>
      </div>
    );
  }

  if (isDashboardError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <RefreshCw className="h-5 w-5 text-destructive" />
          </div>

          <h1 className="mt-5 text-xl font-semibold">
            Unable to load school data
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Something went wrong while loading your school
            information.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          User information is not available.
        </p>
      </div>
    );
  }

  if (user.role !== "ADMIN" && user.role !== "MANAGER") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          You do not have permission to manage classes.
        </p>
      </div>
    );
  }

  const schoolId = user.schoolId;

  if (!schoolId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold">
            School not found
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Your account is not connected to a school.
          </p>
        </div>
      </div>
    );
  }

  if (selectedClass) {
    return (
      <SectionManagement
        schoolId={schoolId}
        schoolClass={selectedClass}
        onBack={() => setSelectedClass(null)}
      />
    );
  }

  return (
    <ClassManagement
      schoolId={schoolId}
      onManageSections={(schoolClass) =>
        setSelectedClass(schoolClass)
      }
    />
  );
}
