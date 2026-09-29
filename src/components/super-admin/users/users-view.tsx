"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import type { UserCategoryKey } from "@/features/super-admin/users/constants";
import { useSchoolUserSummary } from "@/features/super-admin/users/hooks";

import { RoleUserList } from "./role-user-list";
import { SchoolUserDetails } from "./school-user-details";
import { SchoolUserList } from "./school-user-list";

type View =
  | { type: "schools" }
  | { type: "school"; schoolId: number }
  | { type: "role"; schoolId: number; role: UserCategoryKey };

function SchoolDetailsScreen({
  schoolId,
  onBack,
  onSelectCategory,
}: {
  schoolId: number;
  onBack: () => void;
  onSelectCategory: (role: UserCategoryKey) => void;
}) {
  const { data, isLoading, isError, refetch } = useSchoolUserSummary(schoolId);

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-xl border bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-6">
        <p className="font-medium text-destructive">
          Failed to load school users.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <SchoolUserDetails
      data={data}
      onBack={onBack}
      onSelectCategory={onSelectCategory}
    />
  );
}

export function UsersView() {
  const [view, setView] = useState<View>({ type: "schools" });

  if (view.type === "school") {
    return (
      <SchoolDetailsScreen
        schoolId={view.schoolId}
        onBack={() => setView({ type: "schools" })}
        onSelectCategory={(role) =>
          setView({ type: "role", schoolId: view.schoolId, role })
        }
      />
    );
  }

  if (view.type === "role") {
    return (
      <RoleUserList
        schoolId={view.schoolId}
        role={view.role}
        onBack={() => setView({ type: "school", schoolId: view.schoolId })}
      />
    );
  }

  return (
    <SchoolUserList
      onSelectSchool={(schoolId) => setView({ type: "school", schoolId })}
    />
  );
}