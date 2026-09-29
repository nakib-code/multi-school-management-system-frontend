"use client";

import {
  Activity,
  Building2,
  Clock3,
  ShieldBan,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { DashboardCard } from "@/components/layout/dashboard-card";
import { PageHeader } from "@/components/shared/page-header";
import type { School } from "@/types/school";
import { getSchools } from "@/features/schools/api";

export default function SuperAdminDashboardPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [totalSchools, setTotalSchools] = useState(0);
  const [pendingSchools, setPendingSchools] = useState(0);
  const [activeSchools, setActiveSchools] = useState(0);
  const [blockedSchools, setBlockedSchools] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        const result = await getSchools({
          page: 1,
          limit: 100,
        });

        const schoolList = result.schools;

        setSchools(schoolList);
        setTotalSchools(result.meta.total);

        setPendingSchools(
          schoolList.filter(
            (school) => school.status === "PENDING",
          ).length,
        );

        setActiveSchools(
          schoolList.filter(
            (school) => school.status === "ACTIVE",
          ).length,
        );

        setBlockedSchools(
          schoolList.filter(
            (school) => school.status === "BLOCKED",
          ).length,
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data";

        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const recentSchools = [...schools]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Dashboard"
        description="Overview of schools and platform activity."
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Total Schools"
          value={loading ? "—" : totalSchools}
          description="All registered schools"
          icon={Building2}
        />

        <DashboardCard
          title="Pending Schools"
          value={loading ? "—" : pendingSchools}
          description="Waiting for approval"
          icon={Clock3}
        />

        <DashboardCard
          title="Active Schools"
          value={loading ? "—" : activeSchools}
          description="Currently active"
          icon={Activity}
        />

        <DashboardCard
          title="Blocked Schools"
          value={loading ? "—" : blockedSchools}
          description="Currently blocked"
          icon={ShieldBan}
        />
      </div>

      {/* Recent Schools */}
      <div className="rounded-xl border bg-background">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">
            Recent School Registrations
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            The latest schools registered on the platform.
          </p>
        </div>

        <div className="divide-y">
          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Loading recent schools...
            </div>
          ) : recentSchools.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              No schools registered yet.
            </div>
          ) : (
            recentSchools.map((school) => (
              <div
                key={school.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {school.name}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Code: {school.code}
                    {school.adminEmail
                      ? ` • ${school.adminEmail}`
                      : ""}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
                    school.status === "ACTIVE"
                      ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                      : school.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                        : school.status === "BLOCKED"
                          ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400"
                  }`}
                >
                  {school.status}
                </span>
              </div>
            ))
          )}
        </div>

        {!loading && totalSchools > 5 && (
          <div className="border-t px-5 py-4">
            <a
              href="/dashboard/super-admin/schools"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all schools →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
