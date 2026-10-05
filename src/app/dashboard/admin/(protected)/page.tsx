"use client";

import {
  BookOpen,
  GraduationCap,
  Layers3,
  Loader2,
  RefreshCw,
  School,
  Users,
} from "lucide-react";

import { DashboardCard } from "@/components/layout/dashboard-card";
import { useDashboard } from "@/features/dashboard/hooks";
import type { SchoolDashboard } from "@/features/dashboard/types";

export default function AdminDashboardPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useDashboard();

  /*
   * Loading
   */
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  /*
   * Error
   */
  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
            <RefreshCw className="h-5 w-5 text-destructive" />
          </div>

          <h1 className="mt-5 text-xl font-semibold">
            Unable to load dashboard
          </h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Something went wrong while loading your
            dashboard statistics.
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

  /*
   * Invalid / SUPER_ADMIN data
   */
  if (!data || data.role === "SUPER_ADMIN") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold">
            Dashboard unavailable
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Admin dashboard data is not available.
          </p>
        </div>
      </div>
    );
  }

  const dashboard = data as SchoolDashboard;

  const { stats } = dashboard;

  /*
   * Dashboard statistics
   */
  const dashboardStats = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      description: "Students in your school",
      icon: GraduationCap,
    },
    {
      title: "Total Teachers",
      value: stats.totalTeachers,
      description: "Teachers in your school",
      icon: Users,
    },
    {
      title: "Total Managers",
      value: stats.totalManagers,
      description: "Managers in your school",
      icon: Users,
    },
    {
      title: "Total Classes",
      value: stats.totalClasses,
      description: "Classes created",
      icon: School,
    },
    {
      title: "Total Sections",
      value: stats.totalSections,
      description: "Sections created",
      icon: Layers3,
    },
    {
      title: "Total Subjects",
      value: stats.totalSubjects,
      description: "Subjects available",
      icon: BookOpen,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Admin Dashboard
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your school management system.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardStats.map((stat) => (
          <DashboardCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* School Overview */}
      <div className="rounded-2xl border bg-background p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <School className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h2 className="font-semibold">
              School Overview
            </h2>

            <p className="text-sm text-muted-foreground">
              Your school statistics are updated from the
              system.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <OverviewItem
            label="Students"
            value={stats.totalStudents}
          />

          <OverviewItem
            label="Teachers"
            value={stats.totalTeachers}
          />

          <OverviewItem
            label="Classes"
            value={stats.totalClasses}
          />

          <OverviewItem
            label="Subjects"
            value={stats.totalSubjects}
          />
        </div>
      </div>
    </div>
  );
}

interface OverviewItemProps {
  label: string;
  value: number;
}

function OverviewItem({
  label,
  value,
}: OverviewItemProps) {
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}