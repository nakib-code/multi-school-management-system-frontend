"use client";

import {
BookOpen,
Building2,
GraduationCap,
Users,
} from "lucide-react";

import { DashboardCard } from "@/components/layout/dashboard-card";
import { PageHeader } from "@/components/shared/page-header";
import { useDashboard } from "@/features/dashboard/hooks";

export default function AdminDashboardPage() {
const {
data,
isLoading,
isError,
refetch,
} = useDashboard();

const stats =
data?.role === "ADMIN" || data?.role === "MANAGER"
? data.stats
: undefined;

return ( <div className="space-y-6"> <PageHeader
     title="Admin Dashboard"
     description="Overview of your school's students, teachers, classes, and activities."
   />

  {isError && (
    <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-destructive">
          Failed to load dashboard data.
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Please check your connection and try again.
        </p>
      </div>

      <button
        type="button"
        onClick={() => refetch()}
        className="w-fit rounded-lg border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        Try again
      </button>
    </div>
  )}

  {/* Overview Stats */}

  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <DashboardCard
      title="Total Students"
      value={
        isLoading
          ? "—"
          : (stats?.totalStudents ?? 0)
      }
      description="Students in your school"
      icon={GraduationCap}
    />

    <DashboardCard
      title="Total Teachers"
      value={
        isLoading
          ? "—"
          : (stats?.totalTeachers ?? 0)
      }
      description="Teaching staff"
      icon={Users}
    />

    <DashboardCard
      title="Total Classes"
      value={
        isLoading
          ? "—"
          : (stats?.totalClasses ?? 0)
      }
      description="Classes in your school"
      icon={Building2}
    />

    <DashboardCard
      title="Total Subjects"
      value={
        isLoading
          ? "—"
          : (stats?.totalSubjects ?? 0)
      }
      description="Available subjects"
      icon={BookOpen}
    />
  </div>

  {/* School Overview */}

  <div className="rounded-xl border bg-background">
    <div className="border-b px-5 py-4">
      <h2 className="font-semibold">
        School Overview
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        A quick overview of your school's academic resources.
      </p>
    </div>

    <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          Students
        </p>

        <p className="mt-2 text-2xl font-bold">
          {isLoading
            ? "—"
            : (stats?.totalStudents ?? 0)}
        </p>
      </div>

      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          Teachers
        </p>

        <p className="mt-2 text-2xl font-bold">
          {isLoading
            ? "—"
            : (stats?.totalTeachers ?? 0)}
        </p>
      </div>

      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          Managers
        </p>

        <p className="mt-2 text-2xl font-bold">
          {isLoading
            ? "—"
            : (stats?.totalManagers ?? 0)}
        </p>
      </div>

      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          Classes
        </p>

        <p className="mt-2 text-2xl font-bold">
          {isLoading
            ? "—"
            : (stats?.totalClasses ?? 0)}
        </p>
      </div>

      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          Sections
        </p>

        <p className="mt-2 text-2xl font-bold">
          {isLoading
            ? "—"
            : (stats?.totalSections ?? 0)}
        </p>
      </div>

      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          Subjects
        </p>

        <p className="mt-2 text-2xl font-bold">
          {isLoading
            ? "—"
            : (stats?.totalSubjects ?? 0)}
        </p>
      </div>
    </div>
  </div>
</div>
);
}
