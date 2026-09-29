"use client";

import { useQueries } from "@tanstack/react-query";
import { AlertCircle, Building2, Loader2, Users } from "lucide-react";
import { useMemo } from "react";

// Adjust to where your useSchools hook lives
import { getSchoolUserSummary } from "@/features/super-admin/users/api";
import { schoolUsersKeys } from "@/features/super-admin/users/hooks";

import { SchoolUserCard } from "./school-user-card";
import { useSchools } from "@/features/schools/hooks";

interface SchoolUserListProps {
  onSelectSchool: (schoolId: number) => void;
}

export function SchoolUserList({ onSelectSchool }: SchoolUserListProps) {
  const { data, isLoading, isError } = useSchools({
    page: 1,
    limit: 100,
    status: "ACTIVE",
  });

  const activeSchools = useMemo(
    () => (data?.schools ?? []).filter((school) => school.status === "ACTIVE"),
    [data],
  );

  const summaryQueries = useQueries({
    queries: activeSchools.map((school) => ({
      queryKey: schoolUsersKeys.summary(school.id),
      queryFn: () => getSchoolUserSummary(school.id),
      staleTime: 60_000,
    })),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading schools...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-6">
        <p className="font-medium text-destructive">Failed to load schools.</p>
        <p className="mt-1 text-sm text-muted-foreground">Please try again.</p>
      </div>
    );
  }

  if (activeSchools.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border bg-background text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mt-3 font-medium">No schools found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          There are no active schools available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <div>
          <h2 className="font-semibold">Schools</h2>
          <p className="text-sm text-muted-foreground">
            Select a school to view its users.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {activeSchools.map((school, index) => {
          const query = summaryQueries[index];

          if (query?.isError) {
            return (
              <div
                key={school.id}
                className="rounded-xl border border-destructive/30 bg-destructive/5 p-5"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{school.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Failed to load users.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => query.refetch()}
                    className="rounded-md border px-2.5 py-1 text-xs hover:bg-muted"
                  >
                    Retry
                  </button>
                </div>
              </div>
            );
          }

          if (!query?.data) {
            return (
              <div
                key={school.id}
                className="rounded-xl border bg-background p-5"
              >
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div>
                    <p className="font-medium">{school.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Loading users...
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <SchoolUserCard
              key={school.id}
              school={query.data}
              onClick={() => onSelectSchool(school.id)}
            />
          );
        })}
      </div>
    </div>
  );
}